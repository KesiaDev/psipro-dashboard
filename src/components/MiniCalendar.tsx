import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMiniCalendarDays } from "@/hooks/useMiniCalendarDays";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { daysWithAppointments, loading, refetch } = useMiniCalendarDays();

  const today = new Date().getDate();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    refetch(currentYear, currentMonth);
  }, [currentYear, currentMonth, refetch]);

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="card-soft p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold text-foreground">
          {MONTHS[currentMonth]} {currentYear}
        </h3>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="h-48 animate-pulse bg-muted/30 rounded-lg" />
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {DAYS.map((day) => (
            <div key={day} className="py-2 text-center text-[11px] font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          {blanks.map((b) => (
            <div key={`blank-${b}`} />
          ))}
          {days.map((day) => {
            const isToday = day === today && currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
            const hasAppointment = daysWithAppointments.includes(day);
            return (
              <button
                key={day}
                className={`relative flex h-9 w-full items-center justify-center rounded-lg text-sm transition-colors
                  ${isToday
                    ? "bg-primary font-semibold text-primary-foreground"
                    : "text-foreground hover:bg-muted"
                  }
                `}
              >
                {day}
                {hasAppointment && !isToday && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
