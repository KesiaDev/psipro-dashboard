import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/services/api";

export interface PatientPatterns {
  dominantThemes: string[];
  predominantEmotions: string[];
  detectedPatterns: string[];
  therapeuticAlerts: string[];
}

export interface UsePatientPatternsState {
  patterns: PatientPatterns | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

function toArray(val: unknown): string[] {
  return Array.isArray(val) ? val.map(String) : [];
}

function parsePatterns(raw: Record<string, unknown>): PatientPatterns {
  return {
    dominantThemes: toArray(
      raw.dominantThemes ?? raw.dominant_themes ?? raw.temas_dominantes ?? raw.themes
    ),
    predominantEmotions: toArray(
      raw.predominantEmotions ?? raw.predominant_emotions ?? raw.emocoes_predominantes ?? raw.emotions
    ),
    detectedPatterns: toArray(
      raw.detectedPatterns ?? raw.detected_patterns ?? raw.padroes_detectados ?? raw.patterns
    ),
    therapeuticAlerts: toArray(
      raw.therapeuticAlerts ?? raw.therapeutic_alerts ?? raw.alertas_terapeuticos ?? raw.alerts
    ),
  };
}

export function usePatientPatterns(patientId: string | undefined): UsePatientPatternsState {
  const [patterns, setPatterns] = useState<PatientPatterns | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchPatterns = useCallback(async () => {
    if (!patientId) {
      setPatterns(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Record<string, unknown>>(`/patients/${patientId}/patterns`);
      const data = (res?.patterns ?? res?.data ?? res) as Record<string, unknown>;
      setPatterns(parsePatterns(data ?? {}));
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr?.status === 404) {
        setPatterns({
          dominantThemes: [],
          predominantEmotions: [],
          detectedPatterns: [],
          therapeuticAlerts: [],
        });
        setError(null);
      } else {
        setError(err as ApiError);
        setPatterns(null);
      }
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    fetchPatterns();
  }, [fetchPatterns]);

  return { patterns, loading, error, refetch: fetchPatterns };
}
