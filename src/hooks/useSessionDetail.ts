import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/services/api";

export interface SessionAIAnalysis {
  summary?: string;
  themes?: string[];
  emotions?: string[];
  actionItems?: string[];
  riskFlags?: string[];
}

export interface SessionDetail {
  id: string | number;
  patient: string;
  patientId?: string;
  patient_id?: string;
  professional_id?: string;
  date: string;
  time?: string;
  duration?: string;
  duration_minutes?: number;
  type?: string;
  status?: string;
  notes?: string;
  scheduled_at?: string;
  start_at?: string;
  aiAnalysis?: SessionAIAnalysis;
}

export interface UseSessionDetailState {
  session: SessionDetail | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function parseAIAnalysis(raw: Record<string, unknown> | null | undefined): SessionAIAnalysis | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  return {
    summary: (raw.summary as string) ?? undefined,
    themes: Array.isArray(raw.themes) ? raw.themes.map(String) : undefined,
    emotions: Array.isArray(raw.emotions) ? raw.emotions.map(String) : undefined,
    actionItems: Array.isArray(raw.actionItems) ? raw.actionItems.map(String) : undefined,
    riskFlags: Array.isArray(raw.riskFlags) ? raw.riskFlags.map(String) : undefined,
  };
}

export function useSessionDetail(id: string | undefined): UseSessionDetailState {
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchSession = useCallback(async () => {
    if (!id) {
      setSession(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Record<string, unknown>>(`/sessions/${id}`);
      const data = (res?.session ?? res?.data ?? res) as Record<string, unknown>;
      const patientName =
        (data.patient_name as string) ??
        (data.patient as Record<string, unknown>)?.name ??
        (data.patient as string) ??
        "—";
      const startAt = (data.start_at as string) ?? (data.scheduled_at as string) ?? (data.date as string);
      const aiRaw =
        (data.aiAnalysis ?? data.ai_analysis ?? data.ai) as Record<string, unknown> | undefined;
      const aiFromTopLevel =
        (data.summary ?? data.themes ?? data.emotions ?? data.actionItems ?? data.riskFlags) != null
          ? (data as Record<string, unknown>)
          : undefined;

      const durationMin = Number(data.duration_minutes ?? data.duration ?? 50);
      setSession({
        id: data.id ?? id,
        patient: patientName,
        patientId: data.patient_id ? String(data.patient_id) : undefined,
        patient_id: data.patient_id != null ? String(data.patient_id) : undefined,
        professional_id: data.professional_id != null ? String(data.professional_id) : undefined,
        date: formatDate(startAt),
        time: formatTime(startAt),
        duration: durationMin >= 60 ? `${Math.floor(durationMin / 60)}h ${durationMin % 60 > 0 ? `${durationMin % 60}min` : ""}`.trim() : `${durationMin} min`,
        duration_minutes: durationMin,
        type: (data.type as string) ?? (data.session_type as string),
        status: data.status as string,
        notes: data.notes as string,
        scheduled_at: (data.scheduled_at as string) ?? (data.start_at as string),
        start_at: data.start_at as string,
        aiAnalysis: parseAIAnalysis(aiRaw ?? aiFromTopLevel),
      });
    } catch (err) {
      setError(err as ApiError);
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return { session, loading, error, refetch: fetchSession };
}
