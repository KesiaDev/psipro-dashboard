import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecentPatient } from "@/hooks/useRecentPatients";
import type { ApiError } from "@/services/api";

interface RecentPatientsProps {
  patients: RecentPatient[];
  loading?: boolean;
  error?: ApiError | null;
}

const progressStyles: Record<string, { label: string; dot: string }> = {
  _undefined: { label: "Não definido", dot: "bg-muted" },
  improving: { label: "Evoluindo", dot: "bg-primary" },
  stable: { label: "Estável", dot: "bg-chart-amber" },
  attention: { label: "Atenção", dot: "bg-destructive" },
};

export function RecentPatients({ patients, loading, error }: RecentPatientsProps) {
  const navigate = useNavigate();

  if (error) {
    return (
      <div className="card-soft p-6 animate-fade-in">
        <h3 className="font-heading text-base font-semibold text-foreground mb-5">Pacientes Recentes</h3>
        <div className="text-center py-6 text-destructive text-sm">
          {(error as ApiError).status === 401
            ? "Sessão expirada."
            : (error as ApiError).status === 403
              ? "Acesso negado."
              : (error as ApiError).message}
        </div>
      </div>
    );
  }

  return (
    <section className="card-soft p-6 animate-fade-in" style={{ animationDelay: "0.15s" }} aria-labelledby="recent-patients-heading">
      <h3 id="recent-patients-heading" className="font-heading text-base font-semibold text-foreground mb-5">Pacientes Recentes</h3>
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground text-sm">
          Nenhum paciente recente.
        </div>
      ) : (
        <ul className="space-y-4" role="list">
          {patients.map((p) => (
            <li
              key={p.id ?? p.name + p.lastSession}
              className="flex items-center gap-3"
              {...(p.id && {
                tabIndex: 0,
                role: "button",
                onClick: () => navigate(`/patients/${p.id}`),
                onKeyDown: (e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/patients/${p.id}`); } },
                "aria-label": `Paciente ${p.name}, ${p.sessions} sessões. Pressione Enter para ver detalhes.`,
                className: "flex items-center gap-3 cursor-pointer rounded-lg hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card -m-1 p-1",
              })}
            >
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
                <span className={`h-2 w-2 rounded-full ${progressStyles[p.progress ?? "_undefined"]?.dot ?? progressStyles._undefined.dot}`} />
                <span className="text-xs text-muted-foreground">{progressStyles[p.progress ?? "_undefined"]?.label ?? "Não definido"}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
