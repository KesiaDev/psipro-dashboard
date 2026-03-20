import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/services/api";
import { toast } from "sonner";
import { useClinic } from "@/contexts/ClinicContext";

export interface SessionItem {
  id: string | number;
  patient: string;
  patient_id?: string;
  initials: string;
  date: string;
  time: string;
  duration: string;
  duration_minutes?: number;
  type: string;
  status: "completed" | "scheduled" | "cancelled" | "in-progress";
  /** boolean = flag da lista (tem notas); string = texto das notas (para edição) */
  notes?: boolean | string;
  scheduled_at?: string;
  professional_id?: string;
}

/** Campos clínicos da sessão (prontuário) */
export interface SessionClinicalData {
  emotional_state?: number; // 1-10, humor/estado emocional
  evolution_notes?: string; // evolução do paciente
  interventions?: string; // técnicas/intervenções utilizadas
  homework?: string; // tarefas de casa e combinados
  risk_status?: "normal" | "low" | "medium" | "high"; // status de risco
}

export interface CreateSessionInput {
  patient_id: string;
  professional_id?: string;
  clinic_id?: string;
  scheduled_at: string;
  duration_minutes?: number;
  type?: string;
  notes?: string;
  /** Campos clínicos do prontuário da sessão */
  clinical?: SessionClinicalData;
}

/** Dados da sessão criada (retornados pela API) */
export interface CreatedSession {
  id: string | number;
  patient_id?: string;
  patient_name?: string;
}

export interface UseSessionsDataState {
  sessions: SessionItem[];
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
  createSession: (input: CreateSessionInput) => Promise<{ ok: boolean; session?: CreatedSession }>;
  updateSession: (id: string | number, input: CreateSessionInput) => Promise<boolean>;
  deleteSession: (id: string | number) => Promise<boolean>;
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
  const { clinicId } = useClinic();
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
          patient_id: s.patient_id != null ? String(s.patient_id) : (s.patient as { id?: string })?.id != null ? String((s.patient as { id: string }).id) : undefined,
          initials: getInitials(patientName),
          date: formatDate(startAt),
          time: formatTime(startAt),
          duration: durationStr,
          duration_minutes: durationMin,
          type: (s.type as string) ?? (s.session_type as string) ?? "",
          status: ((s.status as string) ?? "scheduled") as SessionItem["status"],
          notes: Boolean(s.has_notes ?? s.notes ?? false),
          scheduled_at: startAt as string,
          professional_id: s.professional_id != null ? String(s.professional_id) : undefined,
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
    if (clinicId) fetchSessions();
  }, [clinicId, fetchSessions]);

  const createSession = useCallback(
    async (input: CreateSessionInput): Promise<{ ok: boolean; session?: CreatedSession }> => {
      try {
        // Backend NestJS espera camelCase (como em appointments)
        // Backend aceita apenas: patientId, date, professionalId, notes
        const payload: Record<string, unknown> = {
          patientId: input.patient_id,
          date: input.scheduled_at, // ISO 8601
        };
        if (input.professional_id) payload.professionalId = input.professional_id;
        if (input.notes) payload.notes = input.notes;
        // clinicId vai no header X-Clinic-Id, não no body
        const res = await api.post<Record<string, unknown>>("/sessions", payload);
        const data = (res?.session ?? res?.data ?? res) as Record<string, unknown> | undefined;
        const session: CreatedSession | undefined = data
          ? {
              id: data.id ?? "",
              patient_id: data.patient_id != null ? String(data.patient_id) : (data.patientId as string),
              patient_name: (data.patient_name as string) ?? ((data.patient as { name?: string })?.name),
            }
          : undefined;
        toast.success("Sessão criada com sucesso");
        await fetchSessions();
        return { ok: true, session };
      } catch (err) {
        const apiErr = err as ApiError;
        toast.error(apiErr?.message ?? "Erro ao criar sessão");
        return { ok: false };
      }
    },
    [clinicId, fetchSessions]
  );

  const updateSession = useCallback(
    async (id: string | number, input: CreateSessionInput): Promise<boolean> => {
      try {
        // Backend DTO aceita apenas: patientId, date, professionalId, duration, notes
        const payload: Record<string, unknown> = {
          patientId: input.patient_id,
          date: input.scheduled_at,
        };
        if (input.professional_id) payload.professionalId = input.professional_id;
        if (input.duration_minutes != null) payload.duration = input.duration_minutes;
        if (input.notes) payload.notes = input.notes;
        // type e clinical não são aceitos pelo backend — remover do payload para evitar 400
        await api.patch(`/sessions/${id}`, payload);
        toast.success("Sessão atualizada");
        await fetchSessions();
        return true;
      } catch (err) {
        const apiErr = err as ApiError;
        toast.error(apiErr?.message ?? "Erro ao atualizar sessão");
        return false;
      }
    },
    [fetchSessions]
  );

  const deleteSession = useCallback(
    async (id: string | number): Promise<boolean> => {
      try {
        await api.delete(`/sessions/${id}`);
        toast.success("Sessão excluída");
        await fetchSessions();
        return true;
      } catch (err) {
        const apiErr = err as ApiError;
        toast.error(apiErr?.message ?? "Erro ao excluir sessão");
        return false;
      }
    },
    [fetchSessions]
  );

  return { sessions, loading, error, refetch: fetchSessions, createSession, updateSession, deleteSession };
}
