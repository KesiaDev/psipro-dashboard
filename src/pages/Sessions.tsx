import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useClinic } from "@/contexts/ClinicContext";
import { usePatients } from "@/hooks/usePatients";
import { useProfessionals } from "@/hooks/useProfessionals";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Plus, FileText, Clock, Calendar, MoreVertical,
  Pencil, Trash2, CheckCircle2, TimerIcon, XCircle, CalendarClock,
  TrendingUp, Users, Activity, ChevronRight,
} from "lucide-react";
import { CreateSessionDialog } from "@/components/sessions/CreateSessionDialog";
import { EditSessionDialog } from "@/components/sessions/EditSessionDialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSessionsData } from "@/hooks/useSessionsData";
import { useFinancialRecords } from "@/hooks/useFinancialRecords";
import { ErrorState } from "@/components/ErrorState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { VOICE_EVENT_OPEN_NEW_SESSION } from "@/components/VoiceCommandButton";

const STATUS = {
  completed:   { label: "Concluída",    icon: CheckCircle2,  pill: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  scheduled:   { label: "Agendada",     icon: CalendarClock, pill: "bg-primary/15 text-primary border-primary/20" },
  "in-progress":{ label: "Em andamento", icon: Activity,      pill: "bg-amber-500/15 text-amber-400 border-amber-500/20" },
  cancelled:   { label: "Cancelada",    icon: XCircle,       pill: "bg-destructive/15 text-destructive border-destructive/20" },
} as const;

const FILTERS = ["all", "completed", "scheduled", "in-progress", "cancelled"] as const;

const Sessions = () => {
  const navigate = useNavigate();
  const { selectedClinic } = useClinic();
  const { patients } = usePatients();
  const { professionals } = useProfessionals(selectedClinic?.id);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showSessionDialog, setShowSessionDialog] = useState(false);
  const { sessions, loading, error, refetch, createSession, updateSession, deleteSession } = useSessionsData();
  const { addRecord } = useFinancialRecords();
  const [editingSession, setEditingSession] = useState<typeof sessions[0] | null>(null);
  const [deletingSession, setDeletingSession] = useState<typeof sessions[0] | null>(null);
  const [deletingInProgress, setDeletingInProgress] = useState(false);

  useEffect(() => {
    const handler = () => setShowSessionDialog(true);
    window.addEventListener(VOICE_EVENT_OPEN_NEW_SESSION, handler);
    return () => window.removeEventListener(VOICE_EVENT_OPEN_NEW_SESSION, handler);
  }, []);

  const filtered = sessions.filter((s) => {
    const matchesSearch = s.patient.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || s.status === filter;
    let matchesDate = true;
    if (s.scheduled_at && (dateFrom || dateTo)) {
      const d = s.scheduled_at.slice(0, 10);
      if (dateFrom && d < dateFrom) matchesDate = false;
      if (dateTo && d > dateTo) matchesDate = false;
    }
    return matchesSearch && matchesFilter && matchesDate;
  });

  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  // KPIs
  const total = sessions.length;
  const completed = sessions.filter((s) => s.status === "completed").length;
  const scheduled = sessions.filter((s) => s.status === "scheduled").length;
  const inProgress = sessions.filter((s) => s.status === "in-progress").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (error) {
    const err = error as { status?: number; message?: string };
    return (
      <DashboardLayout title="Sessões">
        <ErrorState
          title={err.status === 401 ? "Sessão expirada" : err.status === 403 ? "Acesso negado" : "Erro ao carregar sessões"}
          message={err.message ?? "Não foi possível carregar os dados."}
          status={err.status}
          onRetry={refetch}
        />
      </DashboardLayout>
    );
  }

  if (loading && sessions.length === 0) {
    return (
      <DashboardLayout title="Sessões">
        <LoadingSkeleton variant="list" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Sessões">
      <div className="space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Sessões</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Histórico e gerenciamento de atendimentos</p>
          </div>
          <Button
            className="gold-gradient text-primary-foreground rounded-xl gap-2 shrink-0"
            onClick={() => setShowSessionDialog(true)}
          >
            <Plus className="h-4 w-4" />
            Nova Sessão
          </Button>
        </div>

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total */}
          <div className="card-soft p-5 space-y-3 animate-fade-in" style={{ animationDelay: "0s" }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</p>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="font-heading text-3xl font-bold text-foreground">{total}</p>
            <p className="text-xs text-muted-foreground">sessões registradas</p>
          </div>

          {/* Concluídas */}
          <div className="card-soft p-5 space-y-3 animate-fade-in" style={{ animationDelay: "0.05s" }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Concluídas</p>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <p className="font-heading text-3xl font-bold text-foreground">{completed}</p>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Taxa de conclusão</p>
                <p className="text-xs font-semibold text-emerald-400">{completionRate}%</p>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Agendadas */}
          <div className="card-soft p-5 space-y-3 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Agendadas</p>
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarClock className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="font-heading text-3xl font-bold text-foreground">{scheduled}</p>
            <p className="text-xs text-muted-foreground">próximas sessões</p>
          </div>

          {/* Em andamento */}
          <div className="card-soft p-5 space-y-3 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Em andamento</p>
              <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Activity className="h-4 w-4 text-amber-400" />
              </div>
            </div>
            <p className="font-heading text-3xl font-bold text-foreground">{inProgress}</p>
            <p className="text-xs text-muted-foreground">sessões ativas agora</p>
          </div>
        </div>

        {/* ── Dialogs ── */}
        <CreateSessionDialog
          open={showSessionDialog}
          onOpenChange={setShowSessionDialog}
          patients={patients}
          professionals={professionals}
          onSave={async (input) => {
            const result = await createSession(input);
            if (result.ok && result.session) {
              const patient = patients.find((p) => p.id === result.session!.patient_id);
              const patientName = patient?.full_name ?? patient?.name ?? result.session.patient_name ?? "Paciente";
              const dateStr = input.scheduled_at
                ? new Date(input.scheduled_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
                : "";
              try {
                await addRecord({
                  type: "income", category: "session",
                  description: `Sessão - ${patientName} - ${dateStr}`,
                  amount: 0, status: "pending",
                  patient_id: result.session.patient_id ?? null,
                  session_id: String(result.session.id),
                });
              } catch { /* financeiro opcional */ }
            }
            return result.ok;
          }}
        />

        <EditSessionDialog
          open={!!editingSession}
          onOpenChange={(open) => !open && setEditingSession(null)}
          session={editingSession}
          patients={patients}
          professionals={professionals}
          onSave={updateSession}
        />

        <AlertDialog open={!!deletingSession} onOpenChange={(open) => !open && !deletingInProgress && setDeletingSession(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir sessão</AlertDialogTitle>
              <AlertDialogDescription>Tem certeza? Esta ação não pode ser desfeita.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deletingInProgress}>Cancelar</AlertDialogCancel>
              <Button
                variant="destructive"
                disabled={deletingInProgress}
                onClick={async () => {
                  if (!deletingSession) return;
                  setDeletingInProgress(true);
                  try { const ok = await deleteSession(deletingSession.id); if (ok) setDeletingSession(null); }
                  finally { setDeletingInProgress(false); }
                }}
              >
                {deletingInProgress ? "Excluindo..." : "Excluir"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* ── Search & Filters ── */}
        <div className="card-soft p-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-xl bg-background border-border h-10"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-muted-foreground shrink-0">De</label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-xl bg-background border-border w-[130px] h-10 text-sm" />
              </div>
              <div className="flex items-center gap-1.5">
                <label className="text-xs text-muted-foreground shrink-0">Até</label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-xl bg-background border-border w-[130px] h-10 text-sm" />
              </div>
              {(dateFrom || dateTo) && (
                <Button variant="ghost" size="sm" className="rounded-xl text-xs h-10" onClick={() => { setDateFrom(""); setDateTo(""); }}>
                  Limpar
                </Button>
              )}
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 flex-wrap">
            {FILTERS.map((f) => {
              const cfg = f === "all" ? null : STATUS[f as keyof typeof STATUS];
              const isActive = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {cfg && <cfg.icon className="h-3 w-3" />}
                  {f === "all" ? "Todas" : cfg?.label}
                  {f !== "all" && (
                    <span className={`ml-0.5 rounded-full px-1.5 py-0 text-[10px] font-bold ${isActive ? "bg-primary-foreground/20" : "bg-muted"}`}>
                      {sessions.filter((s) => s.status === f).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Session list ── */}
        {Object.keys(grouped).length === 0 ? (
          <div className="card-soft p-16 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-muted mx-auto flex items-center justify-center">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Nenhuma sessão encontrada</p>
            <p className="text-xs text-muted-foreground">Tente ajustar os filtros ou criar uma nova sessão.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, dateSessions]) => (
              <div key={date} className="animate-fade-in">
                {/* Date divider */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <h3 className="font-heading text-sm font-semibold text-foreground">{date}</h3>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground shrink-0">{dateSessions.length} sess{dateSessions.length !== 1 ? "ões" : "ão"}</span>
                </div>

                <div className="space-y-2">
                  {dateSessions.map((session) => {
                    const cfg = STATUS[session.status] ?? STATUS.scheduled;
                    const StatusIcon = cfg.icon;
                    return (
                      <div
                        key={session.id}
                        onClick={() => navigate(`/sessions/${session.id}`, { state: { sessionFromList: session } })}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/sessions/${session.id}`, { state: { sessionFromList: session } }); } }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Sessão de ${session.patient}, ${session.date}`}
                        className="group card-soft p-4 flex items-center gap-4 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {/* Avatar */}
                        <Avatar className="h-11 w-11 shrink-0">
                          <AvatarFallback className="gold-gradient text-primary-foreground text-xs font-bold">
                            {session.initials}
                          </AvatarFallback>
                        </Avatar>

                        {/* Info */}
                        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                          {/* Patient + type */}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {session.patient}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">{session.type || "—"}</p>
                          </div>

                          {/* Time + duration */}
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span className="text-sm">{session.time}</span>
                            <span className="text-xs">·</span>
                            <TimerIcon className="h-3.5 w-3.5 shrink-0" />
                            <span className="text-xs">{session.duration}</span>
                          </div>

                          {/* Status + notes */}
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${cfg.pill}`}>
                              <StatusIcon className="h-3 w-3" />
                              {cfg.label}
                            </span>
                            {session.notes && (
                              <span className="inline-flex items-center gap-1 text-[11px] text-primary font-medium">
                                <FileText className="h-3 w-3" />
                                Notas
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Arrow hint on hover */}
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1" />

                        {/* Actions */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingSession(session); }}>
                              <Pencil className="h-4 w-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={(e) => { e.stopPropagation(); setDeletingSession(session); }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Sessions;
