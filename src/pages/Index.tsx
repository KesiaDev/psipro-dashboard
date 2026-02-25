import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { AppointmentsList } from "@/components/AppointmentsList";
import { MiniCalendar } from "@/components/MiniCalendar";
import { RecentPatients } from "@/components/RecentPatients";
import { Users, CalendarDays, TrendingUp, Clock } from "lucide-react";

const Index = () => {
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">
            Bom dia, Dra. Maria 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Você tem 5 consultas agendadas para hoje.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Pacientes Ativos"
            value="48"
            change="+3 este mês"
            changeType="positive"
            icon={Users}
          />
          <StatCard
            title="Consultas Hoje"
            value="5"
            change="2 pendentes"
            changeType="neutral"
            icon={CalendarDays}
          />
          <StatCard
            title="Taxa de Retorno"
            value="92%"
            change="+4% vs. mês anterior"
            changeType="positive"
            icon={TrendingUp}
          />
          <StatCard
            title="Horas Atendidas"
            value="32h"
            change="Esta semana"
            changeType="neutral"
            icon={Clock}
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AppointmentsList />
          </div>
          <div className="space-y-6">
            <MiniCalendar />
            <RecentPatients />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
