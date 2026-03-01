import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";

export interface SessionItem {
  id: string | number;
  patient: string;
  initials: string;
  date: string;
  time: string;
  duration: string;
  type: string;
  status: "completed" | "scheduled" | "cancelled" | "in-progress";
  notes: boolean;
}

export interface UseSessionsDataState {
  sessions: SessionItem[];
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
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

export function useSessionsData(): UseSessionsDataState {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ sessions?: Record<string, unknown>[]; data?: Record<string, unknown>[] }>("/sessions");
      const raw = res.sessions ?? res.data ?? (Array.isArray(res) ? res : []);
      const mapped: SessionItem[] = raw.map((s: Record<string, unknown>) => {
        const patientName = (s.patient_name as string) ?? (s.patient as { name?: string })?.name ?? "—";
        const startAt = (s.start_at as string) ?? (s.scheduled_at as string) ?? (s.date as string);
        const durationMin = Number(s.duration_minutes ?? s.duration ?? 50);
        const durationStr = durationMin >= 60
          ? `${Math.floor(durationMin / 60)}h ${durationMin % 60 > 0 ? `${durationMin % 60}min` : ""}`.trim()
          : `${durationMin} min`;
        return {
          id: s.id ?? "",
          patient: patientName,
          initials: getInitials(patientName),
          date: formatDate(startAt),
          time: formatTime(startAt),
          duration: durationStr,
          type: (s.type as string) ?? (s.session_type as string) ?? "",
          status: ((s.status as string) ?? "scheduled") as SessionItem["status"],
          notes: Boolean(s.has_notes ?? s.notes ?? false),
        };
      });
      setSessions(mapped);
    } catch (err) {
      setError(err as ApiError);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return { sessions, loading, error, refetch: fetchSessions };
}
