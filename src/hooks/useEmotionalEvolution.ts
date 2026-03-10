import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/services/api";

export interface TimelineDataPoint {
  date: string;
  [emotion: string]: string | number;
}

export interface EmotionFrequencyEntry {
  emotion: string;
  count: number;
}

export interface EmotionTrendEntry {
  emotion: string;
  trend: "increasing" | "decreasing" | "stable";
}

export interface EmotionalEvolutionData {
  timelineData: TimelineDataPoint[];
  emotionFrequency: EmotionFrequencyEntry[];
  trend: EmotionTrendEntry[];
}

export interface UseEmotionalEvolutionState {
  data: EmotionalEvolutionData | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

function parseEmotionalEvolution(raw: Record<string, unknown>): EmotionalEvolutionData {
  const timelineRaw = raw.timelineData ?? raw.timeline_data ?? [];
  const timelineData: TimelineDataPoint[] = Array.isArray(timelineRaw)
    ? timelineRaw.map((row: Record<string, unknown>) => {
        const out: TimelineDataPoint = { date: String(row.date ?? "") };
        for (const [k, v] of Object.entries(row)) {
          if (k !== "date" && v != null) out[k] = Number(v) ?? 0;
        }
        return out;
      })
    : [];

  const freqRaw = raw.emotionFrequency ?? raw.emotion_frequency ?? [];
  const emotionFrequency: EmotionFrequencyEntry[] = Array.isArray(freqRaw)
    ? freqRaw.map((e: Record<string, unknown>) => ({
        emotion: String(e.emotion ?? ""),
        count: Number(e.count ?? 0),
      }))
    : [];

  const trendRaw = raw.trend ?? raw.trends ?? [];
  const trend: EmotionTrendEntry[] = Array.isArray(trendRaw)
    ? trendRaw.map((t: Record<string, unknown>) => ({
        emotion: String(t.emotion ?? ""),
        trend: (t.trend as "increasing" | "decreasing" | "stable") ?? "stable",
      }))
    : [];

  return { timelineData, emotionFrequency, trend };
}

export function useEmotionalEvolution(patientId: string | undefined): UseEmotionalEvolutionState {
  const [data, setData] = useState<EmotionalEvolutionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchData = useCallback(async () => {
    if (!patientId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Record<string, unknown>>(`/patients/${patientId}/emotional-evolution`);
      const parsed = parseEmotionalEvolution((res as Record<string, unknown>) ?? {});
      setData(parsed);
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr?.status === 404) {
        setData({ timelineData: [], emotionFrequency: [], trend: [] });
        setError(null);
      } else {
        setError(apiErr);
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
