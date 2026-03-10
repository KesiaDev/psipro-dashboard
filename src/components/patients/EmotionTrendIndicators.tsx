import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { EmotionTrendEntry } from "@/hooks/useEmotionalEvolution";

interface EmotionTrendIndicatorsProps {
  trends: EmotionTrendEntry[];
}

export function EmotionTrendIndicators({ trends }: EmotionTrendIndicatorsProps) {
  if (trends.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {trends.map((item, i) => {
        const Icon =
          item.trend === "increasing"
            ? TrendingUp
            : item.trend === "decreasing"
              ? TrendingDown
              : Minus;
        const colorClass =
          item.trend === "increasing"
            ? "text-destructive"
            : item.trend === "decreasing"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-muted-foreground";
        const label =
          item.trend === "increasing"
            ? "Aumentando"
            : item.trend === "decreasing"
              ? "Diminuindo"
              : "Estável";

        return (
          <div
            key={`${item.emotion}-${i}`}
            className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-1.5 text-sm"
          >
            <Icon className={`h-4 w-4 ${colorClass}`} aria-hidden="true" />
            <span className="font-medium text-foreground">{item.emotion}</span>
            <span className={`text-xs ${colorClass}`}>({label})</span>
          </div>
        );
      })}
    </div>
  );
}
