import { Activity } from "lucide-react";

type Status = "operational" | "degraded" | "down";

const STATUS_CONFIG: Record<Status, { label: string; dotClass: string; bgClass: string }> = {
  operational: {
    label: "Operacional",
    dotClass: "bg-emerald-500",
    bgClass: "bg-emerald-500/10 border-emerald-500/30",
  },
  degraded: {
    label: "Degradado",
    dotClass: "bg-amber-500",
    bgClass: "bg-amber-500/10 border-amber-500/30",
  },
  down: {
    label: "Indisponível",
    dotClass: "bg-red-500",
    bgClass: "bg-red-500/10 border-red-500/30",
  },
};

interface HealthStatusIndicatorProps {
  status: Status;
  loading?: boolean;
}

/** Indicador visual de status: verde (operacional), amarelo (degradado), vermelho (erro). */
export function HealthStatusIndicator({ status, loading }: HealthStatusIndicatorProps) {
  const config = STATUS_CONFIG[status];

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-3 w-3 rounded-full bg-muted animate-pulse" />
        <span className="text-sm text-muted-foreground">Verificando...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-3 w-3 rounded-full ${config.dotClass} ${
          status === "operational" ? "shadow-[0_0_8px_rgba(16,185,129,0.6)]" : ""
        }`}
        title={config.label}
        aria-hidden="true"
      />
      <span className="text-sm font-medium text-foreground">{config.label}</span>
    </div>
  );
}
