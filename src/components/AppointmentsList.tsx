import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Appointment {
  id: number;
  patient: string;
  initials: string;
  time: string;
  type: string;
  status: "confirmed" | "pending" | "completed";
}

const appointments: Appointment[] = [
  { id: 1, patient: "Ana Souza", initials: "AS", time: "09:00", type: "Terapia Individual", status: "confirmed" },
  { id: 2, patient: "Carlos Lima", initials: "CL", time: "10:30", type: "Avaliação Inicial", status: "confirmed" },
  { id: 3, patient: "Beatriz Ferreira", initials: "BF", time: "14:00", type: "Terapia de Casal", status: "pending" },
  { id: 4, patient: "Diego Santos", initials: "DS", time: "15:30", type: "Terapia Individual", status: "confirmed" },
  { id: 5, patient: "Fernanda Oliveira", initials: "FO", time: "17:00", type: "Retorno", status: "pending" },
];

const statusStyles: Record<string, string> = {
  confirmed: "bg-accent text-accent-foreground",
  pending: "bg-secondary text-muted-foreground",
  completed: "bg-muted text-muted-foreground",
};

const statusLabels: Record<string, string> = {
  confirmed: "Confirmado",
  pending: "Pendente",
  completed: "Concluído",
};

export function AppointmentsList() {
  return (
    <div className="card-soft p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-heading text-base font-semibold text-foreground">Consultas de Hoje</h3>
        <span className="text-xs font-medium text-muted-foreground">25 Fev, 2026</span>
      </div>
      <div className="space-y-3">
        {appointments.map((apt) => (
          <div
            key={apt.id}
            className="flex items-center gap-4 rounded-xl border border-border p-3.5 transition-colors hover:bg-muted/50"
          >
            <Avatar className="h-10 w-10">
              <AvatarFallback className="gold-gradient text-primary-foreground text-xs font-semibold">
                {apt.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{apt.patient}</p>
              <p className="text-xs text-muted-foreground">{apt.type}</p>
            </div>
            <div className="text-right flex flex-col items-end gap-1.5">
              <span className="text-sm font-semibold text-foreground">{apt.time}</span>
              <Badge variant="secondary" className={`text-[10px] font-medium px-2 py-0.5 rounded-lg ${statusStyles[apt.status]}`}>
                {statusLabels[apt.status]}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
