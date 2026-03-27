import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Phone, Mail, MoreHorizontal, FileSpreadsheet, User, Pencil, Calendar, Trash2, RefreshCw, Users, Link } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { api } from "@/services/api";
import { VOICE_EVENT_FOCUS_PATIENT_SEARCH } from "@/components/VoiceCommandButton";
import { ErrorState } from "@/components/ErrorState";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { AddPatientDialog } from "@/components/patients/AddPatientDialog";
import { EditPatientModal } from "@/components/patients/edit-patient-modal";
import { ImportPatientsModal } from "@/components/patients/import-patients-modal";
import type { Patient } from "@/hooks/usePatients";

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-accent text-accent-foreground" },
  inactive: { label: "Inativo", className: "bg-muted text-muted-foreground" },
  new: { label: "Novo", className: "bg-primary/20 text-primary" },
};

const progressConfig: Record<string, { label: string; dot: string }> = {
  improving: { label: "Evoluindo", dot: "bg-primary" },
  stable: { label: "Estável", dot: "bg-chart-amber" },
  attention: { label: "Atenção", dot: "bg-destructive" },
  /** Quando progress não foi definido pelo profissional, exibe "Não definido" em vez de "Estável" */
  _undefined: { label: "Não definido", dot: "bg-muted" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

const Patients = () => {
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const { patients, loading, error, refetch, createPatient, deletePatient, deleteManyPatients } = usePatients();
  const [patientToDelete, setPatientToDelete] = useState<{ id: string; name: string } | null>(null);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteMode, setBulkDeleteMode] = useState<"selected" | "all" | null>(null);
  const [intakeLink, setIntakeLink] = useState<string | null>(null);
  const [generatingIntake, setGeneratingIntake] = useState(false);
  const [intakeCopied, setIntakeCopied] = useState(false);

  const handleGenerateIntakeLink = async () => {
    setGeneratingIntake(true);
    try {
      const data = await api.post<{ token: string; link: string; expiresAt: string }>(
        "/patients/intake-token"
      );
      setIntakeLink(data.link);
      setIntakeCopied(false);
    } catch {
      toast.error("Erro ao gerar link de intake");
    } finally {
      setGeneratingIntake(false);
    }
  };

  const handleCopyIntakeLink = async () => {
    if (!intakeLink) return;
    await navigator.clipboard.writeText(intakeLink);
    setIntakeCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setIntakeCopied(false), 3000);
  };

  useEffect(() => {
    const handler = () => searchInputRef.current?.focus();
    window.addEventListener(VOICE_EVENT_FOCUS_PATIENT_SEARCH, handler);
    return () => window.removeEventListener(VOICE_EVENT_FOCUS_PATIENT_SEARCH, handler);
  }, []);

  const filtered = patients.filter((p) => {
    const name = (p.full_name ?? p.name ?? "").toLowerCase();
    const phone = (p.phone ?? "").replace(/\D/g, "");
    const searchLower = search.toLowerCase().trim();
    const searchDigits = search.replace(/\D/g, "");
    const matchesSearch =
      !searchLower ||
      name.includes(searchLower) ||
      (searchDigits.length >= 2 && phone.includes(searchDigits));
    const matchesFilter = filter === "all" || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (error) {
    const err = error as { status?: number; message?: string };
    return (
      <DashboardLayout title="Pacientes">
        <ErrorState
          title={err.status === 401 ? "Sessão expirada" : err.status === 403 ? "Acesso negado" : "Erro ao carregar pacientes"}
          message={err.message ?? "Não foi possível carregar os dados."}
          status={err.status}
          onRetry={refetch}
        />
      </DashboardLayout>
    );
  }

  if (loading && patients.length === 0) {
    return (
      <DashboardLayout title="Pacientes">
        <LoadingSkeleton variant="list" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Pacientes">
      <div className="space-y-8 p-1">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">Pacientes</h1>
            <p className="text-sm text-muted-foreground">{patients.length} pacientes cadastrados</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl shrink-0"
              onClick={() => refetch()}
              disabled={loading}
              title="Atualizar lista"
              aria-label="Atualizar lista de pacientes"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
            </Button>
            <AddPatientDialog
              open={showAddDialog}
              onOpenChange={setShowAddDialog}
              onSave={async (input) => {
                const created = await createPatient(input);
                if (created) {
                  setShowAddDialog(false);
                }
                return created;
              }}
            />
            <Button
              variant="outline"
              className="rounded-xl gap-2"
              onClick={handleGenerateIntakeLink}
              disabled={generatingIntake}
            >
              {generatingIntake ? (
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Link className="h-4 w-4" />
              )}
              {generatingIntake ? "Gerando..." : "Link de Intake"}
            </Button>
            <Button
              variant="outline"
              className="rounded-xl gap-2"
              onClick={() => setShowImportModal(true)}
            >
              <FileSpreadsheet className="h-4 w-4" />
              Importar Excel
            </Button>
            <Button
              className="gold-gradient text-primary-foreground rounded-xl gap-2"
              onClick={() => setShowAddDialog(true)}
              aria-label="Adicionar novo paciente"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Novo Paciente
            </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1" role="search">
            <label htmlFor="patient-search" className="sr-only">Buscar pacientes por nome ou telefone</label>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              ref={searchInputRef}
              id="patient-search"
              placeholder="Buscar paciente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl bg-card border-border"
              aria-label="Buscar pacientes por nome ou telefone"
            />
          </div>
          <div className="flex gap-2">
            {["all", "active", "new", "inactive"].map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "secondary"}
                size="sm"
                className="rounded-xl text-xs"
                onClick={() => setFilter(f)}
              >
                {f === "all" ? "Todos" : f === "active" ? "Ativos" : f === "new" ? "Novos" : "Inativos"}
              </Button>
            ))}
          </div>
        </div>

        <ImportPatientsModal
          open={showImportModal}
          onOpenChange={setShowImportModal}
          onSuccess={refetch}
        />

        {/* Modal de Link de Intake */}
        <AlertDialog open={!!intakeLink} onOpenChange={(open) => !open && setIntakeLink(null)}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Link className="h-5 w-5 text-primary" />
                Link de Intake Gerado
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p>Envie este link para o paciente pelo WhatsApp ou e-mail. Válido por <strong>7 dias</strong>.</p>
                  <div
                    className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2.5 cursor-pointer hover:bg-muted/80 transition-colors"
                    onClick={handleCopyIntakeLink}
                    title="Clique para copiar"
                  >
                    <span className="flex-1 text-sm text-foreground break-all select-all font-mono">
                      {intakeLink}
                    </span>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setIntakeLink(null)}>Fechar</AlertDialogCancel>
              <AlertDialogAction onClick={handleCopyIntakeLink}>
                {intakeCopied ? "✓ Copiado!" : "Copiar link"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Barra de exclusão em lote */}
        {filtered.length > 0 && (
          <div className="card-soft p-4 flex flex-wrap items-center gap-3">
            <Checkbox
              id="select-all"
              checked={
                selectedIds.size === 0
                  ? false
                  : selectedIds.size === filtered.length
                    ? true
                    : "indeterminate"
              }
              onCheckedChange={(checked) => {
                if (checked) {
                  setSelectedIds(new Set(filtered.map((p) => p.id)));
                } else {
                  setSelectedIds(new Set());
                }
              }}
              aria-label="Selecionar todos os pacientes"
            />
            <label htmlFor="select-all" className="text-sm text-muted-foreground cursor-pointer">
              Selecionar todos ({filtered.length})
            </label>
            {selectedIds.size > 0 && (
              <>
                <span className="text-sm font-medium text-foreground">
                  {selectedIds.size} selecionado(s)
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setBulkDeleteMode("selected")}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir selecionados
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => setBulkDeleteMode("all")}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Excluir todos
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl"
                  onClick={() => { setSelectedIds(new Set()); setBulkDeleteMode(null); }}
                >
                  Desmarcar
                </Button>
              </>
            )}
          </div>
        )}

        {patientToEdit && (
          <EditPatientModal
            open={!!patientToEdit}
            onOpenChange={(open) => !open && setPatientToEdit(null)}
            patientId={patientToEdit.id}
            patientData={patientToEdit}
            onSuccess={refetch}
          />
        )}

        <AlertDialog open={!!patientToDelete} onOpenChange={(open) => !open && setPatientToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir paciente</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir <strong>{patientToDelete?.name}</strong>? Esta ação é irreversível e remove todos os dados do paciente em conformidade com a LGPD.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async () => {
                  if (patientToDelete && (await deletePatient(patientToDelete.id))) {
                    setPatientToDelete(null);
                  }
                }}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirmação: excluir selecionados */}
        <AlertDialog open={bulkDeleteMode === "selected"} onOpenChange={(open) => !open && setBulkDeleteMode(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir pacientes selecionados</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir <strong>{selectedIds.size} paciente(s)</strong>? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async () => {
                  const ids = Array.from(selectedIds);
                  await deleteManyPatients(ids);
                  setSelectedIds(new Set());
                  setBulkDeleteMode(null);
                }}
              >
                Excluir {selectedIds.size}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Confirmação: excluir todos */}
        <AlertDialog open={bulkDeleteMode === "all"} onOpenChange={(open) => !open && setBulkDeleteMode(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir todos os pacientes</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir <strong>todos os {filtered.length} paciente(s)</strong> da lista? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async () => {
                  const ids = filtered.map((p) => p.id);
                  await deleteManyPatients(ids);
                  setSelectedIds(new Set());
                  setBulkDeleteMode(null);
                }}
              >
                Excluir todos
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Patient List */}
        <div className="grid gap-3">
          {filtered.length === 0 ? (
            <div className="card-soft p-8 md:p-12">
              {patients.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Nenhum paciente cadastrado"
                  description="Adicione seu primeiro paciente para começar a gerenciar seu atendimento."
                  actionLabel="Novo Paciente"
                  onAction={() => setShowAddDialog(true)}
                />
              ) : (
                <EmptyState
                  icon={Search}
                  title="Nenhum paciente encontrado"
                  description="Tente ajustar a busca ou os filtros para encontrar o paciente."
                />
              )}
            </div>
          ) : (
            filtered.map((patient, i) => (
              <div
                key={patient.id}
                className="card-soft p-4 flex items-center gap-4 hover:shadow-md transition-shadow animate-fade-in"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div
                  className="shrink-0"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedIds.has(patient.id)}
                    onCheckedChange={(checked) => {
                      setSelectedIds((prev) => {
                        const next = new Set(prev);
                        if (checked) next.add(patient.id);
                        else next.delete(patient.id);
                        return next;
                      });
                    }}
                    aria-label={`Selecionar ${patient.full_name ?? patient.name ?? "—"}`}
                  />
                </div>
                <div
                  className="flex-1 min-w-0 flex items-center gap-4 cursor-pointer"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/patients/${patient.id}`); } }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Paciente ${patient.full_name ?? patient.name ?? "—"}, ${patient.age ?? "—"} anos, ${patient.sessions ?? 0} sessões. Pressione Enter para ver detalhes.`}
                >
                <Avatar className="h-11 w-11">
                  <AvatarFallback className="gold-gradient text-primary-foreground text-sm font-semibold">
                    {getInitials(patient.full_name ?? patient.name ?? "")}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-4 items-center">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {patient.full_name ?? patient.name ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {patient.age ?? "—"} anos · {patient.sessions ?? 0} sessões
                    </p>
                  </div>

                  <div className="hidden sm:block min-w-0">
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                      <Mail className="h-3 w-3" /> {patient.email ?? "—"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1.5">
                      <Phone className="h-3 w-3" /> {patient.phone ?? "—"}
                    </p>
                  </div>

                  <div className="hidden sm:block">
                    <p className="text-xs text-muted-foreground">Última sessão</p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDate(patient.lastSession ?? patient.last_session_at)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className={`rounded-lg text-[10px] px-2 py-0.5 ${statusConfig[patient.status]?.className ?? statusConfig.active.className}`}
                    >
                      {statusConfig[patient.status]?.label ?? patient.status}
                    </Badge>
                    <div className="flex items-center gap-1.5" title={patient.progress ? undefined : "Defina a evolução do paciente ao editar o cadastro"}>
                      <span
                        className={`h-2 w-2 rounded-full ${progressConfig[patient.progress ?? "_undefined"]?.dot ?? progressConfig._undefined.dot}`}
                      />
                      <span className="text-xs text-muted-foreground">
                        {progressConfig[patient.progress ?? "_undefined"]?.label ?? "Não definido"}
                      </span>
                    </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-xl text-muted-foreground hover:text-destructive shrink-0 h-9 w-9"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPatientToDelete({ id: patient.id, name: patient.full_name ?? patient.name ?? "—" });
                    }}
                    aria-label={`Excluir paciente ${patient.full_name ?? patient.name ?? "—"}`}
                    title="Excluir paciente (LGPD)"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-xl text-muted-foreground hover:text-foreground shrink-0 h-9 w-9"
                      aria-label={`Menu de opções do paciente ${patient.full_name ?? patient.name ?? "—"}`}
                    >
                      <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[180px]">
                    <DropdownMenuItem onClick={() => navigate(`/patients/${patient.id}`)}>
                      <User className="h-4 w-4 mr-2" />
                      Ver paciente
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setPatientToEdit(patient)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar paciente
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/sessions?patientId=${patient.id}`)}>
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver sessões
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setPatientToDelete({ id: patient.id, name: patient.full_name ?? patient.name ?? "—" })}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir paciente
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Patients;
