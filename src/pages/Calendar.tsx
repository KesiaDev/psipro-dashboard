import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8h to 18h
const WEEK_DAYS = ["Seg", "Ter", "Qua", "Qui", "Sex"];
const WEEK_DATES = [24, 25, 26, 27, 28]; // Feb 24-28, 2026

interface CalendarEvent {
  id: number;
  patient: string;
  initials: string;
  type: string;
  day: number; // 0-4 (Mon-Fri)
  startHour: number;
  duration: number; // in hours
  status: "confirmed" | "pending" | "completed";
}

const events: CalendarEvent[] = [
  { id: 1, patient: "Ana Souza", initials: "AS", type: "Individual", day: 0, startHour: 9, duration: 1, status: "completed" },
  { id: 2, patient: "Carlos Lima", initials: "CL", type: "Avaliação", day: 0, startHour: 14, duration: 1.5, status: "confirmed" },
  { id: 3, patient: "Beatriz Ferreira", initials: "BF", type: "Casal", day: 1, startHour: 10, duration: 1.5, status: "confirmed" },
  { id: 4, patient: "Diego Santos", initials: "DS", type: "Individual", day: 1, startHour: 15, duration: 1, status: "pending" },
  { id: 5, patient: "Fernanda Oliveira", initials: "FO", type: "Retorno", day: 2, startHour: 9, duration: 1, status: "confirmed" },
  { id: 6, patient: "Helena Costa", initials: "HC", type: "Individual", day: 2, startHour: 11, duration: 1, status: "confirmed" },
  { id: 7, patient: "Igor Almeida", initials: "IA", type: "Avaliação", day: 3, startHour: 8, duration: 1.5, status: "pending" },
  { id: 8, patient: "Ana Souza", initials: "AS", type: "Individual", day: 3, startHour: 14, duration: 1, status: "confirmed" },
  { id: 9, patient: "Gabriel Mendes", initials: "GM", type: "Individual", day: 4, startHour: 10, duration: 1, status: "confirmed" },
  { id: 10, patient: "Carlos Lima", initials: "CL", type: "Individual", day: 4, startHour: 16, duration: 1, status: "pending" },
];

const statusColors: Record<string, string> = {
  confirmed: "border-l-primary bg-primary/10",
  pending: "border-l-chart-amber bg-chart-amber/10",
  completed: "border-l-muted-foreground bg-muted/50",
};

const Calendar = () => {
  const todayIndex = 1; // Tuesday (Feb 25)

  return (
    <DashboardLayout title="Agenda">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">Agenda</h1>
              <p className="text-sm text-muted-foreground">Semana de 24 a 28 de Fevereiro, 2026</p>
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
              {/* Day Headers */}
              <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-border">
                <div className="p-3" />
                {WEEK_DAYS.map((day, i) => (
                  <div key={day} className={`p-3 text-center border-l border-border ${i === todayIndex ? "bg-primary/5" : ""}`}>
                    <p className="text-xs text-muted-foreground">{day}</p>
                    <p className={`font-heading text-lg font-bold ${i === todayIndex ? "text-primary" : "text-foreground"}`}>
                      {WEEK_DATES[i]}
                    </p>
                  </div>
                ))}
              </div>

              {/* Time Grid */}
              <div className="relative">
                {HOURS.map((hour) => (
                  <div key={hour} className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-border/50">
                    <div className="p-2 text-right pr-3">
                      <span className="text-[11px] text-muted-foreground">{`${hour}:00`}</span>
                    </div>
                    {WEEK_DAYS.map((_, dayIndex) => {
                      const dayEvents = events.filter(
                        (e) => e.day === dayIndex && e.startHour === hour
                      );
                      return (
                        <div
                          key={dayIndex}
                          className={`relative border-l border-border/50 min-h-[60px] p-0.5 ${dayIndex === todayIndex ? "bg-primary/[0.02]" : ""}`}
                        >
                          {dayEvents.map((event) => (
                            <div
                              key={event.id}
                              className={`absolute inset-x-0.5 rounded-lg border-l-[3px] p-2 cursor-pointer hover:shadow-md transition-shadow ${statusColors[event.status]}`}
                              style={{
                                height: `${event.duration * 60 - 4}px`,
                              }}
                            >
                              <p className="text-xs font-semibold text-foreground truncate">{event.patient}</p>
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

        {/* Today's Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-soft p-5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <p className="text-xs text-muted-foreground mb-1">Consultas Hoje</p>
            <p className="font-heading text-2xl font-bold text-foreground">4</p>
          </div>
          <div className="card-soft p-5 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <p className="text-xs text-muted-foreground mb-1">Confirmadas</p>
            <p className="font-heading text-2xl font-bold text-primary">3</p>
          </div>
          <div className="card-soft p-5 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <p className="text-xs text-muted-foreground mb-1">Pendentes</p>
            <p className="font-heading text-2xl font-bold text-chart-amber">1</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;
