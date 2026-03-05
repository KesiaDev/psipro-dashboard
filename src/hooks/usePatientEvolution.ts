import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/services/api";

export interface EmotionsBySession {
  sessionId: string | number;
  sessionDate: string;
  emotions: string[];
}

export interface PatientEvolution {
  recurringThemes: string[];
  frequentEmotions: string[];
  emotionsBySession: EmotionsBySession[];
}

export interface UsePatientEvolutionState {
  evolution: PatientEvolution | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

function parseEvolution(raw: Record<string, unknown>): PatientEvolution {
  const recurringThemes = Array.isArray(raw.recurringThemes ?? raw.recurring_themes)
    ? (raw.recurringThemes ?? raw.recurring_themes).map(String)
    : [];

  const frequentEmotions = Array.isArray(raw.frequentEmotions ?? raw.frequent_emotions)
    ? (raw.frequentEmotions ?? raw.frequent_emotions).map(String)
    : [];

  const sessionsRaw = raw.emotionsBySession ?? raw.emotions_by_session ?? raw.sessions;
  const emotionsBySession: EmotionsBySession[] = Array.isArray(sessionsRaw)
    ? sessionsRaw.map((s: Record<string, unknown>) => ({
        sessionId: s.sessionId ?? s.session_id ?? s.id ?? "",
        sessionDate: String(s.sessionDate ?? s.session_date ?? s.date ?? ""),
        emotions: Array.isArray(s.emotions) ? s.emotions.map(String) : [],
      }))
    : [];

  return { recurringThemes, frequentEmotions, emotionsBySession };
}

export function usePatientEvolution(patientId: string | undefined): UsePatientEvolutionState {
  const [evolution, setEvolution] = useState<PatientEvolution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchEvolution = useCallback(async () => {
    if (!patientId) {
      setEvolution(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Record<string, unknown>>(`/patients/${patientId}/evolution`);
      const data = (res?.evolution ?? res?.data ?? res) as Record<string, unknown>;
      setEvolution(parseEvolution(data ?? {}));
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr?.status === 404) {
        setEvolution({ recurringThemes: [], frequentEmotions: [], emotionsBySession: [] });
        setError(null);
      } else {
        setError(err as ApiError);
        setEvolution(null);
      }
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchEvolution();
  }, [fetchEvolution]);

  return { evolution, loading, error, refetch: fetchEvolution };
}
