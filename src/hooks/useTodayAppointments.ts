import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/services/api";
import { useClinic } from "@/contexts/ClinicContext";

export interface TodayAppointment {
  id: string | number;
  session_id?: string | number;
  patient: string;
  initials?: string;
  patientName?: string;
  time: string;
  type: string;
  status: "confirmed" | "pending" | "completed" | "scheduled" | "cancelled";
}

export interface UseTodayAppointmentsState {
  appointments: TodayAppointment[];
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

export function useTodayAppointments(): UseTodayAppointmentsState {
  const { clinicId } = useClinic();
  const [appointments, setAppointments] = useState<TodayAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ appointments?: TodayAppointment[]; data?: TodayAppointment[] }>("/appointments/today");
      const raw = res.appointments ?? res.data ?? (Array.isArray(res) ? res : []);
      const mapped: TodayAppointment[] = raw.map((a: Record<string, unknown>) => ({
        id: a.id ?? "",
        session_id: a.session_id != null ? a.session_id : a.sessionId != null ? a.sessionId : undefined,
        patient: (a.patient as string) ?? (a.patientName as string) ?? "—",
        initials: (a.initials as string) ?? getInitials(((a.patient as string) ?? a.patientName as string) ?? ""),
        time: (a.time as string) ?? (a.startTime as string) ?? "",
        type: (a.type as string) ?? (a.sessionType as string) ?? "",
        status: ((a.status as string) ?? "pending") as TodayAppointment["status"],
      }));
      setAppointments(mapped);
    } catch (err) {
      setError(err as ApiError);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (clinicId) {
      fetchAppointments();
    } else {
      setLoading(true);
      setAppointments([]);
      setError(null);
    }
  }, [clinicId, fetchAppointments]);

  return { appointments, loading, error, refetch: fetchAppointments };
}
