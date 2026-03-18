import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { AppointmentsList } from "@/components/AppointmentsList";
import { MiniCalendar } from "@/components/MiniCalendar";
import { RecentPatients } from "@/components/RecentPatients";
import { ErrorState } from "@/components/ErrorState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Users, CalendarDays, TrendingUp, Clock } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useTodayAppointments } from "@/hooks/useTodayAppointments";
import { useRecentPatients } from "@/hooks/useRecentPatients";

const Index = () => {
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { appointments, loading: appointmentsLoading, error: appointmentsError, refetch: refetchAppointments } = useTodayAppointments();
  const { patients: recentPatients, loading: recentLoading, error: recentError, refetch: refetchRecent } = useRecentPatients();

  const loading = statsLoading || appointmentsLoading || recentLoading;
  const error = statsError || appointmentsError || recentError;

  if (error) {
    const err = error as { status?: number; message?: string };
    const is401 = err.status === 401;
    const is403 = err.status === 403;
    return (
      <DashboardLayout title="Dashboard">
        <ErrorState
          title={is401 ? "Sessão expirada" : is403 ? "Acesso negado" : "Erro ao carregar dados"}
          message={err.message ?? (is401 ? "Faça login novamente para continuar." : is403 ? "Você não tem permissão para visualizar esta página." : "Não foi possível carregar os dados. Verifique a conexão com a API.")}
          status={err.status}
          onRetry={() => {
            refetchStats();
            refetchAppointments();
            refetchRecent();
          }}
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

  const patientsCount = stats?.patientsCount ?? 0;
  const appointmentsToday = stats?.appointmentsToday ?? appointments.length;
  const returnRate = stats?.returnRate ?? 0;
  const hoursThisWeek = stats?.hoursThisWeek ?? 0;

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8 p-1">
        {/* Greeting - dados da API */}
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Você tem {appointmentsToday} consulta{appointmentsToday !== 1 ? "s" : ""} agendada{appointmentsToday !== 1 ? "s" : ""} para hoje.
          </p>
        </div>

        {/* Stats - todos da API */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Pacientes Ativos"
            value={String(patientsCount)}
            change={stats ? "cadastrados" : undefined}
            changeType="positive"
            icon={Users}
          />
          <StatCard
            title="Consultas Hoje"
            value={String(appointmentsToday)}
            change={appointmentsToday > 0 ? "agendadas" : undefined}
            changeType="neutral"
            icon={CalendarDays}
          />
          <StatCard
            title="Taxa de Retorno"
            value={`${returnRate}%`}
            change={stats ? "vs. mês anterior" : undefined}
            changeType="positive"
            icon={TrendingUp}
          />
          <StatCard
            title="Horas Atendidas"
            value={`${hoursThisWeek}h`}
            change="Esta semana"
            changeType="neutral"
            icon={Clock}
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AppointmentsList appointments={appointments ?? []} loading={appointmentsLoading} error={appointmentsError} />
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
