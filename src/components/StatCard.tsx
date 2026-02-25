import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconBg?: string;
}

export function StatCard({ title, value, change, changeType = "neutral", icon: Icon, iconBg }: StatCardProps) {
  return (
    <div className="stat-card flex items-start justify-between animate-fade-in">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="font-heading text-3xl font-bold text-foreground">{value}</p>
        {change && (
          <p className={`text-xs font-medium ${
            changeType === "positive" ? "text-primary" :
            changeType === "negative" ? "text-destructive" :
            "text-muted-foreground"
          }`}>
            {change}
          </p>
        )}
      </div>
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg || "bg-accent"}`}>
        <Icon className="h-5 w-5 text-accent-foreground" />
      </div>
    </div>
  );
}
