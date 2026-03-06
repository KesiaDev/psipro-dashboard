import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/services/api";
import { useClinic } from "@/contexts/ClinicContext";

export interface RecentPatient {
  id?: string;
  name: string;
  initials: string;
  lastSession: string;
  sessions: number;
  progress: "improving" | "stable" | "attention";
}

export interface UseRecentPatientsState {
  patients: RecentPatient[];
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

function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  } catch {
    return "—";
  }
}

export function useRecentPatients(): UseRecentPatientsState {
  const { clinicId } = useClinic();
  const [patients, setPatients] = useState<RecentPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ patients?: Record<string, unknown>[]; data?: Record<string, unknown>[] }>("/patients/recent");
      const raw = res.patients ?? res.data ?? (Array.isArray(res) ? res : []);
      const mapped: RecentPatient[] = raw.slice(0, 5).map((p: Record<string, unknown>) => ({
        id: (p.id as string) ?? undefined,
        name: (p.full_name as string) ?? (p.name as string) ?? "—",
        initials: getInitials(((p.full_name as string) ?? p.name as string) ?? ""),
        lastSession: formatShortDate((p.last_session_at as string) ?? (p.lastSession as string) ?? null),
        sessions: Number(p.sessions_count ?? p.sessions ?? 0),
        progress: ((p.progress as string) ?? "stable") as RecentPatient["progress"],
      }));
      setPatients(mapped);
    } catch (err) {
      setError(err as ApiError);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (clinicId) {
      fetchPatients();
    } else {
      setLoading(true);
      setPatients([]);
      setError(null);
    }
  }, [clinicId, fetchPatients]);

  return { patients, loading, error, refetch: fetchPatients };
}
