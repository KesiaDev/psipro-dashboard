import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Patient {
  name: string;
  initials: string;
  lastSession: string;
  sessions: number;
  progress: "improving" | "stable" | "attention";
}

const patients: Patient[] = [
  { name: "Ana Souza", initials: "AS", lastSession: "22 Fev", sessions: 12, progress: "improving" },
  { name: "Carlos Lima", initials: "CL", lastSession: "20 Fev", sessions: 5, progress: "stable" },
  { name: "Beatriz Ferreira", initials: "BF", lastSession: "18 Fev", sessions: 8, progress: "attention" },
  { name: "Diego Santos", initials: "DS", lastSession: "21 Fev", sessions: 15, progress: "improving" },
];

const progressStyles: Record<string, { label: string; dot: string }> = {
  improving: { label: "Evoluindo", dot: "bg-primary" },
  stable: { label: "Estável", dot: "bg-chart-amber" },
  attention: { label: "Atenção", dot: "bg-destructive" },
};

export function RecentPatients() {
  return (
    <div className="card-soft p-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
      <h3 className="font-heading text-base font-semibold text-foreground mb-5">Pacientes Recentes</h3>
      <div className="space-y-4">
        {patients.map((p) => (
          <div key={p.name} className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-semibold">
                {p.initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
              <p className="text-xs text-muted-foreground">{p.sessions} sessões · {p.lastSession}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${progressStyles[p.progress].dot}`} />
              <span className="text-xs text-muted-foreground">{progressStyles[p.progress].label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
