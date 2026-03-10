import { Badge } from "@/components/ui/badge";
import type { EmotionFrequencyEntry } from "@/hooks/useEmotionalEvolution";

interface EmotionFrequencyCloudProps {
  items: EmotionFrequencyEntry[];
}

const EMOTION_BADGE_COLORS = [
  "bg-chart-amber/20 text-chart-amber border-chart-amber/30",
  "bg-primary/10 text-primary border-primary/20",
  "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
  "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30",
  "bg-violet-500/20 text-violet-600 dark:text-violet-400 border-violet-500/30",
];

export function EmotionFrequencyCloud({ items }: EmotionFrequencyCloudProps) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <Badge
          key={`${item.emotion}-${i}`}
          variant="secondary"
          className={`rounded-lg border ${EMOTION_BADGE_COLORS[i % EMOTION_BADGE_COLORS.length]}`}
        >
          {item.emotion} · {item.count}
        </Badge>
      ))}
    </div>
  );
}
