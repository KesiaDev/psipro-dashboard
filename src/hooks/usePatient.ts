import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/services/api";
import type { Patient } from "./usePatients";

export interface PatientWithSessions extends Patient {
  sessionsList?: Array<{
    id: string | number;
    date: string;
    time?: string;
    duration?: string;
    status?: string;
    type?: string;
    notes?: string;
  }>;
}

export interface UsePatientState {
  patient: PatientWithSessions | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

function mapPatient(raw: Record<string, unknown>): PatientWithSessions {
  const name = (raw.full_name as string) ?? (raw.name as string) ?? "";
  const base: Patient = {
    id: String(raw.id ?? ""),
    full_name: name,
    name,
    email: (raw.email as string) ?? null,
    phone: (raw.phone as string) ?? null,
    date_of_birth: (raw.date_of_birth as string) ?? null,
    cpf: (raw.cpf as string) ?? null,
    notes: (raw.notes as string) ?? null,
    status: ((raw.status as string) ?? "active") as Patient["status"],
    created_at: (raw.created_at as string) ?? (raw.createdAt as string) ?? "",
    updated_at: (raw.updated_at as string) ?? (raw.updatedAt as string) ?? "",
    age: raw.age != null ? Number(raw.age) : undefined,
    sessions: raw.sessions != null ? Number(raw.sessions) : undefined,
    lastSession: (raw.lastSession as string) ?? (raw.last_session_at as string),
    last_session_at: (raw.last_session_at as string) ?? (raw.lastSession as string),
    nextSession: (raw.nextSession as string) ?? (raw.next_session_at as string) ?? null,
    next_session_at: (raw.next_session_at as string) ?? (raw.nextSession as string) ?? null,
    progress: (raw.progress as Patient["progress"]) ?? undefined,
  };

  const sessionsRaw = raw.sessionsList ?? raw.sessions;
  const sessions = Array.isArray(sessionsRaw)
    ? sessionsRaw.map((s) => {
        const startAt = (s.start_at as string) ?? (s.scheduled_at as string) ?? (s.date as string);
        return {
          id: s.id ?? "",
          date: startAt,
          time: startAt,
          duration: String(s.duration_minutes ?? s.duration ?? ""),
          status: (s.status as string) ?? "",
          type: (s.type as string) ?? (s.session_type as string) ?? "",
          notes: (s.notes as string) ?? "",
        };
      })
    : undefined;

  return { ...base, sessionsList: sessions };
}

export function usePatient(id: string | undefined): UsePatientState {
  const [patient, setPatient] = useState<PatientWithSessions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchPatient = useCallback(async () => {
    if (!id) {
      setPatient(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Record<string, unknown>>(`/patients/${id}`);
      const data = (res?.patient ?? res?.data ?? res) as Record<string, unknown>;
      setPatient(mapPatient(data ?? {}));
    } catch (err) {
      setError(err as ApiError);
      setPatient(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  return { patient, loading, error, refetch: fetchPatient };
}
