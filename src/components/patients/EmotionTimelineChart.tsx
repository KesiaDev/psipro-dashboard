import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { TimelineDataPoint } from "@/hooks/useEmotionalEvolution";

const EMOTION_COLORS = [
  "hsl(42, 52%, 53%)",
  "hsl(158, 40%, 50%)",
  "hsl(210, 60%, 55%)",
  "hsl(350, 70%, 60%)",
  "hsl(280, 60%, 55%)",
  "hsl(25, 70%, 55%)",
  "hsl(180, 50%, 45%)",
  "hsl(320, 50%, 55%)",
];

interface EmotionTimelineChartProps {
  data: TimelineDataPoint[];
}

export function EmotionTimelineChart({ data }: EmotionTimelineChartProps) {
  const emotionKeys = data.length > 0
    ? (Object.keys(data[0]).filter((k) => k !== "date") as string[])
    : [];

  const formattedData = data.map((row) => {
    const out: Record<string, string | number> = {
      date: row.date
        ? new Date(row.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
        : row.date,
    };
    for (const key of emotionKeys) {
      out[key] = Number(row[key]) ?? 0;
    }
    return out;
  });

  if (emotionKeys.length === 0 || formattedData.length === 0) return null;

  return (
    <div>
      <table className="sr-only" aria-label="Linha do tempo emocional por data">
        <thead>
          <tr>
            <th>Data</th>
            {emotionKeys.map((k) => (
              <th key={k}>{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {formattedData.map((row, i) => (
            <tr key={i}>
              <td>{row.date}</td>
              {emotionKeys.map((k) => (
                <td key={k}>{row[k]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div aria-hidden="true">
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={formattedData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "12px",
            color: "hsl(var(--foreground))",
            fontSize: "12px",
          }}
          formatter={(value: number, name: string) => [`${value}`, name]}
          labelFormatter={(label) =>
            typeof label === "string" ? label : new Date(label).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
          }
        />
        <Legend
          wrapperStyle={{ fontSize: "12px" }}
          formatter={(value) => <span className="text-muted-foreground">{value}</span>}
        />
        {emotionKeys.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={EMOTION_COLORS[i % EMOTION_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
            name={key}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
      </div>
    </div>
  );
}
