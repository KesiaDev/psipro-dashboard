import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil } from "lucide-react";
import type { TodayAppointment } from "@/hooks/useTodayAppointments";
import type { ApiError } from "@/services/api";

interface AppointmentsListProps {
  appointments: TodayAppointment[];
  loading?: boolean;
  error?: ApiError | null;
}

const statusStyles: Record<string, string> = {
  confirmed: "bg-accent text-accent-foreground",
  pending: "bg-secondary text-muted-foreground",
  completed: "bg-muted text-muted-foreground",
  scheduled: "bg-accent text-accent-foreground",
  cancelled: "bg-destructive/20 text-destructive",
};

const statusLabels: Record<string, string> = {
  confirmed: "Confirmado",
  pending: "Pendente",
  completed: "Concluído",
  scheduled: "Agendado",
  cancelled: "Cancelado",
};

export function AppointmentsList({ appointments, loading, error }: AppointmentsListProps) {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  if (error) {
    return (
      <section className="card-soft p-6 animate-fade-in" aria-labelledby="appointments-today-heading">
        <h3 id="appointments-today-heading" className="font-heading text-base font-semibold text-foreground mb-5">Consultas de Hoje</h3>
        <div className="text-center py-8 text-destructive text-sm">
          {(error as ApiError).status === 401
            ? "Sessão expirada. Faça login novamente."
            : (error as ApiError).status === 403
              ? "Acesso negado."
              : (error as ApiError).message}
        </div>
      </section>
    );
  }

  return (
    <section className="card-soft p-6 animate-fade-in" style={{ animationDelay: "0.1s" }} aria-labelledby="appointments-today-heading" role="region">
      <div className="mb-5 flex items-center justify-between">
        <h3 id="appointments-today-heading" className="font-heading text-base font-semibold text-foreground">Consultas de Hoje</h3>
        <span className="text-xs font-medium text-muted-foreground">{today}</span>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-border p-3.5">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-6 w-16 rounded-lg" />
            </div>
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Nenhuma consulta agendada para hoje.
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((apt) => {
            const targetId = apt.session_id ?? apt.id;
            return (
              <div
                key={apt.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/sessions/${targetId}`)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/sessions/${targetId}`); } }}
                className="flex items-center gap-4 rounded-xl border border-border p-3.5 transition-colors hover:bg-muted/50 cursor-pointer group"
                aria-label={`Consultar ${apt.patient}, ${apt.time}, ${statusLabels[apt.status] ?? apt.status}. Pressione Enter para ver ou editar.`}
              >
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="gold-gradient text-primary-foreground text-xs font-semibold">
                    {apt.initials ?? "—"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{apt.patient}</p>
                  <p className="text-xs text-muted-foreground">{apt.type}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className="text-sm font-semibold text-foreground">{apt.time}</span>
                  <Badge variant="secondary" className={`text-[10px] font-medium px-2 py-0.5 rounded-lg ${statusStyles[apt.status] ?? statusStyles.pending}`}>
                    {statusLabels[apt.status] ?? apt.status}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 opacity-70 group-hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); navigate(`/sessions/${targetId}`); }}
                  title="Editar consulta"
                  aria-label="Editar consulta"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
