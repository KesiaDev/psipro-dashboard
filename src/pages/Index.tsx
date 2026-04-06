import { DashboardLayout } from "@/components/DashboardLayout";
import { AppointmentsList } from "@/components/AppointmentsList";
import { MiniCalendar } from "@/components/MiniCalendar";
import { RecentPatients } from "@/components/RecentPatients";
import { ErrorState } from "@/components/ErrorState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  Users, CalendarDays, Clock, TrendingUp, DollarSign,
  Activity, CheckCircle2, ArrowRight, Wallet,
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useTodayAppointments } from "@/hooks/useTodayAppointments";
import { useRecentPatients } from "@/hooks/useRecentPatients";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

const StatCard = ({
  title, value, sub, icon: Icon, accent = false, onClick,
}: {
  title: string; value: string; sub?: string;
  icon: React.ElementType; accent?: boolean; onClick?: () => void;
}) => (
  <div
    className={`card-soft p-5 space-y-3 transition-all animate-fade-in ${onClick ? "cursor-pointer hover:border-primary/40 hover:shadow-md" : ""}`}
    onClick={onClick}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick(); } : undefined}
  >
    <div className="flex items-center justify-between">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${accent ? "gold-gradient" : "bg-primary/10"}`}>
        <Icon className={`h-4 w-4 ${accent ? "text-primary-foreground" : "text-primary"}`} />
      </div>
    </div>
    <p className="font-heading text-3xl font-bold text-foreground">{value}</p>
    {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { appointments, loading: appointmentsLoading, error: appointmentsError, refetch: refetchAppointments } = useTodayAppointments();
  const { patients: recentPatients, loading: recentLoading, error: recentError, refetch: refetchRecent } = useRecentPatients();

  const loading = statsLoading || appointmentsLoading || recentLoading;
  const error = statsError || appointmentsError || recentError;

  if (error) {
    const err = error as { status?: number; message?: string };
    return (
      <DashboardLayout title="Dashboard">
        <ErrorState
          title={err.status === 401 ? "Sessão expirada" : err.status === 403 ? "Acesso negado" : "Erro ao carregar dados"}
          message={err.message ?? "Não foi possível carregar os dados."}
          status={err.status}
          onRetry={() => { refetchStats(); refetchAppointments(); refetchRecent(); }}
        />
      </DashboardLayout>
    );
  }

  if (loading && !stats) {
    return (
      <DashboardLayout title="Dashboard">
        <LoadingSkeleton variant="page" />
      </DashboardLayout>
    );
  }

  const patientsCount   = stats?.patientsCount ?? 0;
  const appointmentsToday = stats?.appointmentsToday ?? appointments.length;
  const sessionsThisWeek  = stats?.sessionsThisWeek ?? 0;
  const sessionsThisMonth = stats?.sessionsThisMonth ?? 0;
  const hoursThisWeek     = stats?.hoursThisWeek ?? 0;
  const fin               = stats?.financialSummary;
  const receitaMes        = fin?.receitaMes ?? fin?.totalIncome ?? 0;
  const aReceber          = fin?.totalAReceber ?? fin?.pending ?? 0;

  const now  = new Date();
  const dateLabel = now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8 p-1">

        {/* ── Greeting ── */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
              {getGreeting()} 👋
            </h1>
            <p className="text-sm text-muted-foreground capitalize">{dateLabel}</p>
          </div>
          {appointmentsToday > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <CalendarDays className="h-4 w-4" />
              {appointmentsToday} consulta{appointmentsToday !== 1 ? "s" : ""} hoje
            </div>
          )}
        </div>

        {/* ── KPI Grid ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Pacientes"
            value={String(patientsCount)}
            sub="cadastrados"
            icon={Users}
            onClick={() => navigate("/patients")}
          />
          <StatCard
            title="Consultas hoje"
            value={String(appointmentsToday)}
            sub={appointmentsToday > 0 ? "agendadas para hoje" : "nenhuma agendada"}
            icon={CalendarDays}
            accent
            onClick={() => navigate("/calendar")}
          />
          <StatCard
            title="Sessões / semana"
            value={String(sessionsThisWeek)}
            sub={`${sessionsThisMonth} este mês`}
            icon={Activity}
            onClick={() => navigate("/sessions")}
          />
          <StatCard
            title="Horas atendidas"
            value={`${hoursThisWeek}h`}
            sub="esta semana"
            icon={Clock}
          />
        </div>

        {/* ── Financial highlight (se houver dados) ── */}
        {fin && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card-soft p-5 space-y-2 animate-fade-in cursor-pointer hover:border-primary/40 hover:shadow-md transition-all" onClick={() => navigate("/financials")}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Receita do mês</p>
                <DollarSign className="h-4 w-4 text-emerald-400" />
              </div>
              <p className="font-heading text-2xl font-bold text-foreground">
                {receitaMes.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
            <div className="card-soft p-5 space-y-2 animate-fade-in cursor-pointer hover:border-primary/40 hover:shadow-md transition-all" onClick={() => navigate("/financials")}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">A receber</p>
                <Wallet className="h-4 w-4 text-amber-400" />
              </div>
              <p className="font-heading text-2xl font-bold text-foreground">
                {aReceber.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
            <div className="card-soft p-5 space-y-2 animate-fade-in cursor-pointer hover:border-primary/40 hover:shadow-md transition-all" onClick={() => navigate("/financials")}>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Lucro líquido</p>
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              <p className="font-heading text-2xl font-bold text-foreground">
                {(fin.netProfit).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
            </div>
          </div>
        )}

        {/* ── Main content ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <AppointmentsList appointments={appointments ?? []} loading={appointmentsLoading} error={appointmentsError} />

            {/* Quick actions */}
            <div className="card-soft p-5 space-y-3 animate-fade-in">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Acesso rápido</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "Nova sessão",      path: "/sessions",    icon: CheckCircle2 },
                  { label: "Novo agendamento", path: "/calendar",    icon: CalendarDays },
                  { label: "Pacientes",        path: "/patients",    icon: Users },
                  { label: "Financeiro",       path: "/financials",  icon: DollarSign },
                ].map(({ label, path, icon: Icon }) => (
                  <Button
                    key={path}
                    variant="secondary"
                    className="h-auto py-3 flex-col gap-1.5 rounded-xl text-xs"
                    onClick={() => navigate(path)}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <MiniCalendar />
            <RecentPatients patients={recentPatients ?? []} loading={recentLoading} error={recentError} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
