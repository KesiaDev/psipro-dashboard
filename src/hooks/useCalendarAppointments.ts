import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/services/api";
import { toast } from "sonner";

export interface CalendarAppointment {
  id: string | number;
  patient: string;
  initials?: string;
  type: string;
  day: number;
  startHour: number;
  duration: number;
  status: "confirmed" | "pending" | "completed";
  date?: string;
}

export interface CreateAppointmentInput {
  patient_id: string;
  professional_id?: string;
  scheduled_at: string;
  duration_minutes?: number;
  type?: string;
  status?: string;
}

export interface UseCalendarAppointmentsState {
  appointments: CalendarAppointment[];
  loading: boolean;
  error: ApiError | null;
  refetch: (startDate?: string, endDate?: string) => Promise<void>;
  createAppointment: (input: CreateAppointmentInput) => Promise<boolean>;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function useCalendarAppointments(): UseCalendarAppointmentsState {
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchAppointments = useCallback(async (startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);
    try {
      const start = startDate ?? new Date().toISOString().slice(0, 10);
      const end = endDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const res = await api.get<{ appointments?: Record<string, unknown>[]; data?: Record<string, unknown>[] }>(
        `/appointments?start=${start}&end=${end}`
      );
      const raw = res.appointments ?? res.data ?? (Array.isArray(res) ? res : []);

      const weekStart = new Date(start);
      weekStart.setHours(0, 0, 0, 0);
      const day0 = weekStart.getTime();

      const mapped: CalendarAppointment[] = raw.map((a: Record<string, unknown>) => {
        const dateStr = a.date ?? a.scheduled_at ?? a.start_at;
        const d = dateStr ? new Date(dateStr as string) : new Date();
        const dayDiff = Math.floor((d.getTime() - day0) / (24 * 60 * 60 * 1000));
        const day = Math.max(0, Math.min(4, Math.floor(dayDiff / 1)));
        const startHour = d.getHours() + d.getMinutes() / 60;
        const duration = Number(a.duration ?? a.duration_minutes ?? 60) / 60;
        const patientName = (a.patient_name as string) ?? (a.patient as { name?: string })?.name ?? "—";
        return {
          id: a.id ?? "",
          patient: patientName,
          initials: getInitials(patientName),
          type: (a.type as string) ?? (a.session_type as string) ?? "",
          day,
          startHour,
          duration,
          status: ((a.status as string) ?? "pending") as "confirmed" | "pending" | "completed",
          date: dateStr as string,
        };
      });
      setAppointments(mapped);
    } catch (err) {
      setError(err as ApiError);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAppointment = useCallback(async (input: CreateAppointmentInput): Promise<boolean> => {
    try {
      await api.post("/appointments", input);
      toast.success("Agendamento criado com sucesso");
      return true;
    } catch {
      toast.error("Erro ao criar agendamento");
      return false;
    }
  }, []);

  return { appointments, loading, error, refetch: fetchAppointments, createAppointment };
}
