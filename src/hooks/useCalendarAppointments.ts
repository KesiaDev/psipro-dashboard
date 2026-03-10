import { useState, useCallback } from "react";
import { api, ApiError } from "@/services/api";
import { toast } from "sonner";
import { useClinic } from "@/contexts/ClinicContext";

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
  clinic_id?: string;
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
  const { clinicId } = useClinic();
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchAppointments = useCallback(
    async (startDate?: string, endDate?: string) => {
      if (!clinicId) {
        setLoading(false);
        setAppointments([]);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const start = startDate ?? new Date().toISOString().slice(0, 10);
        const end = endDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const weekStart = new Date(start);
        weekStart.setHours(0, 0, 0, 0);
        const day0 = weekStart.getTime();
        const endDateObj = new Date(end);
        endDateObj.setHours(23, 59, 59, 999);

        const toCalendarAppointment = (
          a: Record<string, unknown>,
          prefix = "apt"
        ): CalendarAppointment => {
          const dateStr = a.date ?? a.scheduled_at ?? a.start_at;
          const d = dateStr ? new Date(dateStr as string) : new Date();
          const dayDiff = Math.floor((d.getTime() - day0) / (24 * 60 * 60 * 1000));
          const day = Math.max(0, Math.min(4, Math.floor(dayDiff / 1)));
          const startHour = d.getHours() + d.getMinutes() / 60;
          const duration = Number(a.duration ?? a.duration_minutes ?? 60) / 60;
          const patientName = (a.patient_name as string) ?? (a.patient as { name?: string })?.name ?? "—";
          const rawStatus = (a.status as string) ?? "pending";
          const status: "confirmed" | "pending" | "completed" =
            rawStatus === "realizada" || rawStatus === "completed" ? "completed"
            : rawStatus === "cancelada" || rawStatus === "cancelled" ? "pending"
            : rawStatus === "agendada" || rawStatus === "scheduled" || rawStatus === "em andamento" || rawStatus === "in-progress" ? "confirmed"
            : rawStatus === "confirmed" ? "confirmed"
            : "pending";
          return {
            id: `${prefix}-${a.id ?? ""}`,
            patient: patientName,
            initials: getInitials(patientName),
            type: (a.type as string) ?? (a.session_type as string) ?? "",
            day,
            startHour,
            duration,
            status,
            date: dateStr as string,
          };
        };

        const [appointmentsRes, sessionsRes] = await Promise.all([
          api.get<{ appointments?: Record<string, unknown>[]; data?: Record<string, unknown>[] }>(
            `/appointments?start=${start}&end=${end}`
          ),
          api.get<{ sessions?: Record<string, unknown>[]; data?: Record<string, unknown>[] }>(
            "/sessions"
          ).catch(() => ({ sessions: [], data: [] })),
        ]);

        const aptRaw = appointmentsRes.appointments ?? appointmentsRes.data ?? (Array.isArray(appointmentsRes) ? appointmentsRes : []);
        const sessRaw = sessionsRes.sessions ?? sessionsRes.data ?? (Array.isArray(sessionsRes) ? sessionsRes : []);

        // Remove duplicatas por id dentro de cada fonte (API pode retornar o mesmo item 2x)
        const dedupeById = <T extends Record<string, unknown>>(arr: T[], idKey = "id"): T[] => {
          const seen = new Set<string>();
          return arr.filter((item) => {
            const id = String(item[idKey] ?? "");
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
          });
        };
        const aptDeduped = dedupeById(aptRaw as Record<string, unknown>[]);
        const sessDeduped = dedupeById(sessRaw as Record<string, unknown>[]);

        const sessInRange = sessDeduped.filter((s) => {
          const dateStr = s.start_at ?? s.scheduled_at ?? s.date;
          if (!dateStr) return false;
          const d = new Date(dateStr as string);
          return d >= weekStart && d <= endDateObj;
        });

        const aptMapped = aptDeduped.map((a) => toCalendarAppointment(a));
        const aptIds = new Set(aptDeduped.map((a) => String(a.id ?? "")));
        const dedupKey = (p: string, pid: string | undefined, d: string | undefined) =>
          `${(pid ?? (p ?? "").trim().toLowerCase())}|${d ? new Date(d).toISOString().slice(0, 16) : ""}`;
        const aptKeys = new Set(aptMapped.map((a) => dedupKey(a.patient, undefined, a.date)));

        const sessMapped = sessInRange
          .filter((s) => !aptIds.has(String(s.id ?? "")))
          .map((s) => toCalendarAppointment(s, "sess"))
          .filter((s) => !aptKeys.has(dedupKey(s.patient, undefined, s.date)));

        const seenIds = new Set<string>();
        const merged = [...aptMapped, ...sessMapped].filter((item) => {
          const id = String(item.id);
          if (seenIds.has(id)) return false;
          seenIds.add(id);
          return true;
        });

        const mapped: CalendarAppointment[] = merged.sort((a, b) => {
          const dA = a.date ? new Date(a.date).getTime() : 0;
          const dB = b.date ? new Date(b.date).getTime() : 0;
          return dA - dB;
        });

        setAppointments(mapped);
      } catch (err) {
        setError(err as ApiError);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    },
    [clinicId]
  );

  const createAppointment = useCallback(
    async (input: CreateAppointmentInput): Promise<boolean> => {
      if (!clinicId) {
        toast.error("Selecione uma clínica para criar agendamentos.");
        return false;
      }
      try {
        const payload: Record<string, unknown> = {
          patientId: input.patient_id,
          scheduledAt: input.scheduled_at,
          clinicId,
        };
        if (input.professional_id != null) payload.professionalId = input.professional_id;
        // Backend DTO não aceita durationMinutes na criação; usar default no servidor
        if (input.type != null) payload.type = input.type;
        if (input.status != null) payload.status = input.status;
        await api.post("/appointments", payload);
        toast.success("Agendamento criado com sucesso");
        await fetchAppointments();
        return true;
      } catch (err) {
        const apiErr = err as ApiError;
        toast.error(apiErr?.message ?? "Erro ao criar agendamento");
        return false;
      }
    },
    [clinicId, fetchAppointments]
  );

  return { appointments, loading, error, refetch: fetchAppointments, createAppointment };
}
