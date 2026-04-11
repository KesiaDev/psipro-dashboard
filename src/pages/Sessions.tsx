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

  // Agrupa por data (para referência interna)
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});

  // Agrupa por paciente para o card view
  const byPatient = filtered.reduce<Record<string, { name: string; initials: string; sessions: typeof filtered }>>((acc, s) => {
    const key = s.patient_id ?? s.patient;
    if (!acc[key]) acc[key] = { name: s.patient, initials: s.initials, sessions: [] };
    acc[key].sessions.push(s);
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

        {/* ── Patient cards grid ── */}
        {Object.keys(byPatient).length === 0 ? (
          <div className="card-soft p-16 text-center space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-muted mx-auto flex items-center justify-center">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">Nenhuma sessão encontrada</p>
            <p className="text-xs text-muted-foreground">Tente ajustar os filtros ou criar uma nova sessão.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Object.entries(byPatient).map(([key, { name, initials, sessions: patSessions }]) => {
              // Ordena sessões do paciente: mais recentes primeiro
              const sorted = [...patSessions].sort((a, b) =>
                (b.scheduled_at ?? b.date) > (a.scheduled_at ?? a.date) ? 1 : -1
              );
              const latest = sorted[0];
              const latestCfg = STATUS[latest.status] ?? STATUS.scheduled;
              const LatestIcon = latestCfg.icon;
              const hasNotes = patSessions.some((s) => s.notes);
              const completedCount = patSessions.filter((s) => s.status === "completed").length;

              return (
                <div
                  key={key}
                  className="group card-soft flex flex-col overflow-hidden hover:border-primary/30 hover:shadow-lg transition-all duration-200 animate-fade-in"
                >
                  {/* Card header */}
                  <div className="p-4 flex items-center gap-3 border-b border-border/50">
                    <Avatar className="h-11 w-11 shrink-0">
                      <AvatarFallback className="gold-gradient text-primary-foreground text-xs font-bold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {patSessions.length} sess{patSessions.length !== 1 ? "ões" : "ão"}
                        </span>
                        {completedCount > 0 && (
                          <>
                            <span className="text-muted-foreground/40">·</span>
                            <span className="text-xs text-emerald-400 font-medium">{completedCount} concluída{completedCount !== 1 ? "s" : ""}</span>
                          </>
                        )}
                        {hasNotes && (
                          <>
                            <span className="text-muted-foreground/40">·</span>
                            <span className="inline-flex items-center gap-0.5 text-xs text-primary">
                              <FileText className="h-2.5 w-2.5" /> Notas
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Status da sessão mais recente */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${latestCfg.pill}`}>
                      <LatestIcon className="h-2.5 w-2.5" />
                      {latestCfg.label}
                    </span>
                  </div>

                  {/* Sessions list inside card */}
                  <div className="flex-1 divide-y divide-border/40">
                    {sorted.map((session) => {
                      const cfg = STATUS[session.status] ?? STATUS.scheduled;
                      const SIcon = cfg.icon;
                      return (
                        <div
                          key={session.id}
                          onClick={() => navigate(`/sessions/${session.id}`, { state: { sessionFromList: session } })}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/sessions/${session.id}`, { state: { sessionFromList: session } }); } }}
                          tabIndex={0}
                          role="button"
                          aria-label={`Sessão de ${session.patient}, ${session.date}`}
                          className="group/row px-4 py-3 flex items-center gap-3 hover:bg-muted/40 transition-colors cursor-pointer focus:outline-none"
                        >
                          {/* Date badge */}
                          <div className="h-9 w-9 rounded-lg bg-muted flex flex-col items-center justify-center shrink-0 text-center">
                            <span className="text-[10px] font-semibold text-muted-foreground leading-none">
                              {session.date.split(" ")[1]?.replace(",", "") ?? ""}
                            </span>
                            <span className="text-sm font-bold text-foreground leading-tight">
                              {session.date.split(" ")[0] ?? ""}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 shrink-0" />
                              <span>{session.time}</span>
                              <span className="text-muted-foreground/40">·</span>
                              <TimerIcon className="h-3 w-3 shrink-0" />
                              <span>{session.duration}</span>
                              {session.type && (
                                <>
                                  <span className="text-muted-foreground/40">·</span>
                                  <span className="truncate">{session.type}</span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${cfg.pill}`}>
                              <SIcon className="h-2.5 w-2.5" />
                              {cfg.label}
                            </span>

                            {/* Session actions */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover/row:opacity-100 transition-opacity"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="h-3 w-3" />
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
                        </div>
                      );
                    })}
                  </div>

                  {/* Card footer */}
                  <div className="px-4 py-3 border-t border-border/50 bg-muted/20">
                    <button
                      onClick={() => navigate(`/sessions/${sorted[0].id}`, { state: { sessionFromList: sorted[0] } })}
                      className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                    >
                      Ver detalhes <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Sessions;
