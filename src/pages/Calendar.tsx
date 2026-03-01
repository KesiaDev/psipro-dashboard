import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";
import { useCalendarAppointments } from "@/hooks/useCalendarAppointments";
import { ErrorState } from "@/components/ErrorState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8);
const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex"];

const statusColors: Record<string, string> = {
  confirmed: "border-l-primary bg-primary/10",
  pending: "border-l-chart-amber bg-chart-amber/10",
  completed: "border-l-muted-foreground bg-muted/50",
};

const Calendar = () => {
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  });
  const { appointments, loading, error, refetch } = useCalendarAppointments();

  const weekDates = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d.getDate();
  });
  const todayIndex = (() => {
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      if (d.toDateString() === today.toDateString()) return i;
    }
    return -1;
  })();

  if (error) {
    const err = error as { status?: number; message?: string };
    return (
      <DashboardLayout title="Agenda">
        <ErrorState
          title={err.status === 401 ? "Sessão expirada" : err.status === 403 ? "Acesso negado" : "Erro ao carregar agenda"}
          message={err.message ?? "Não foi possível carregar os dados."}
          status={err.status}
          onRetry={refetch}
        />
      </DashboardLayout>
    );
  }

  if (loading && appointments.length === 0) {
    return (
      <DashboardLayout title="Agenda">
        <LoadingSkeleton variant="page" />
      </DashboardLayout>
    );
  }

  const firstDayOfWeek = new Date(weekStart);
  firstDayOfWeek.setHours(0, 0, 0, 0);
  const day0 = firstDayOfWeek.getTime();

  const getDayIndex = (aptDate: string | undefined) => {
    if (!aptDate) return 0;
    const d = new Date(aptDate);
    d.setHours(0, 0, 0, 0);
    return Math.floor((d.getTime() - day0) / (24 * 60 * 60 * 1000));
  };

  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;
  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  return (
    <DashboardLayout title="Agenda">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Agenda</h1>
              <p className="text-sm text-muted-foreground">
                Semana de {weekDates[0]} a {weekDates[4]} de {weekStart.toLocaleDateString("pt-BR", { month: "long" })}, {weekStart.getFullYear()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="secondary" size="sm" className="rounded-xl text-xs px-4">
                Hoje
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button className="gold-gradient text-primary-foreground rounded-xl gap-2">
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Button>
          </div>
        </div>

        {/* Weekly Calendar */}
        <div className="card-soft overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-border">
                <div className="p-3" />
                {WEEK_DAYS.map((day, i) => (
                  <div
                    key={day}
                    className={`p-3 text-center border-l border-border ${i === todayIndex ? "bg-primary/5" : ""}`}
                  >
                    <p className="text-xs text-muted-foreground">{day}</p>
                    <p
                      className={`font-heading text-lg font-bold ${i === todayIndex ? "text-primary" : "text-foreground"}`}
                    >
                      {weekDates[i]}
                    </p>
                  </div>
                ))}
              </div>

              <div className="relative">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-border/50"
                  >
                    <div className="p-2 text-right pr-3">
                      <span className="text-[11px] text-muted-foreground">{`${hour}:00`}</span>
                    </div>
                    {WEEK_DAYS.map((_, dayIndex) => {
                      const dayEvents = appointments.filter((e) => {
                        const aptDay = getDayIndex(e.date);
                        const aptHour = Math.floor(e.startHour);
                        return aptDay === dayIndex && aptHour === hour;
                      });
                      return (
                        <div
                          key={dayIndex}
                          className={`relative border-l border-border/50 min-h-[60px] p-0.5 ${dayIndex === todayIndex ? "bg-primary/[0.02]" : ""}`}
                        >
                          {dayEvents.map((event) => (
                            <div
                              key={event.id}
                              className={`absolute inset-x-0.5 rounded-lg border-l-[3px] p-2 cursor-pointer hover:shadow-md transition-shadow ${statusColors[event.status] ?? statusColors.pending}`}
                              style={{
                                height: `${event.duration * 60 - 4}px`,
                              }}
                            >
                              <p className="text-xs font-semibold text-foreground truncate">
                                {event.patient}
                              </p>
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="h-2.5 w-2.5" />
                                {event.type}
                              </p>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Today's Summary - dados da API */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-soft p-5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <p className="text-xs text-muted-foreground mb-1">Consultas Hoje</p>
            <p className="font-heading text-2xl font-bold text-foreground">{appointments.length}</p>
          </div>
          <div className="card-soft p-5 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <p className="text-xs text-muted-foreground mb-1">Confirmadas</p>
            <p className="font-heading text-2xl font-bold text-primary">{confirmedCount}</p>
          </div>
          <div className="card-soft p-5 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <p className="text-xs text-muted-foreground mb-1">Pendentes</p>
            <p className="font-heading text-2xl font-bold text-chart-amber">{pendingCount}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
