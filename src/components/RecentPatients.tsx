import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { RecentPatient } from "@/hooks/useRecentPatients";
import type { ApiError } from "@/lib/api";

interface RecentPatientsProps {
  patients: RecentPatient[];
  loading?: boolean;
  error?: ApiError | null;
}

const progressStyles: Record<string, { label: string; dot: string }> = {
  improving: { label: "Evoluindo", dot: "bg-primary" },
  stable: { label: "Estável", dot: "bg-chart-amber" },
  attention: { label: "Atenção", dot: "bg-destructive" },
};

export function RecentPatients({ patients, loading, error }: RecentPatientsProps) {
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
    <div className="card-soft p-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
      <h3 className="font-heading text-base font-semibold text-foreground mb-5">Pacientes Recentes</h3>
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
        <div className="space-y-4">
          {patients.map((p) => (
            <div key={p.name + p.lastSession} className="flex items-center gap-3">
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
                <span className={`h-2 w-2 rounded-full ${progressStyles[p.progress]?.dot ?? progressStyles.stable.dot}`} />
                <span className="text-xs text-muted-foreground">{progressStyles[p.progress]?.label ?? "Estável"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
