import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/services/api";
import { toast } from "sonner";
import { useClinic } from "@/contexts/ClinicContext";

export interface Patient {
  id: string;
  user_id?: string;
  full_name: string;
  name?: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  cpf: string | null;
  notes: string | null;
  status: "active" | "inactive" | "new";
  created_at: string;
  updated_at: string;
  age?: number;
  sessions?: number;
  lastSession?: string;
  last_session_at?: string;
  nextSession?: string | null;
  next_session_at?: string | null;
  progress?: "improving" | "stable" | "attention";
}

export interface CreatePatientInput {
  full_name: string;
  email?: string | null;
  phone?: string | null;
  date_of_birth?: string | null;
  cpf?: string | null;
  notes?: string | null;
  status?: "active" | "inactive" | "new";
}

export interface UsePatientsState {
  patients: Patient[];
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
  createPatient: (input: CreatePatientInput) => Promise<Patient | null>;
  deletePatient: (id: string) => Promise<boolean>;
  deleteManyPatients: (ids: string[]) => Promise<{ success: number; failed: number }>;
}

function mapPatient(raw: Record<string, unknown>): Patient {
  const name = (raw.full_name as string) ?? (raw.name as string) ?? "";
  return {
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
}

export function usePatients(): UsePatientsState {
  const { clinicId } = useClinic();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ patients?: Record<string, unknown>[]; data?: Record<string, unknown>[] }>("/patients");
      const raw = res.patients ?? res.data ?? (Array.isArray(res) ? res : []);
      setPatients(raw.map((p: Record<string, unknown>) => mapPatient(p)));
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
      setLoading(false);
      setError(null);
      setPatients([]);
    }
  }, [clinicId, fetchPatients]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && clinicId) fetchPatients();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [clinicId, fetchPatients]);

  const createPatient = useCallback(async (input: CreatePatientInput): Promise<Patient | null> => {
    try {
      // Tenta snake_case (comum em Prisma/PostgreSQL); backend pode esperar camelCase
      const payload: Record<string, unknown> = {
        full_name: input.full_name?.trim() ?? "",
        status: input.status ?? "active",
      };
      if (input.email?.trim()) payload.email = input.email.trim();
      if (input.phone?.trim()) payload.phone = input.phone.trim();
      if (input.date_of_birth?.trim()) payload.date_of_birth = input.date_of_birth.trim();
      if (input.cpf?.trim()) payload.cpf = input.cpf.trim();
      if (input.notes?.trim()) payload.notes = input.notes.trim();
      const res = await api.post<Patient | Record<string, unknown>>("/patients", payload);
      toast.success("Paciente criado com sucesso");
      await fetchPatients();
      return mapPatient((res as Record<string, unknown>) ?? {});
    } catch (err) {
      const apiErr = err as ApiError;
      const msg = apiErr.message ?? "Erro ao criar paciente";
      toast.error(msg);
      throw err; // Propaga para o modal exibir a mensagem real
    }
  }, [fetchPatients]);

  const getDeleteErrorMessage = (err: ApiError): string => {
    if (err.status === 404) {
      return "Endpoint não encontrado (404). O backend pode não ter DELETE /patients/:id implementado.";
    }
    if (err.status === 403) return "Sem permissão para excluir.";
    if (err.status === 401) return "Sessão expirada. Faça login novamente.";
    return err.message ?? "Erro ao excluir paciente.";
  };

  const deletePatient = useCallback(async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/patients/${id}`);
      toast.success("Paciente excluído com sucesso");
      await fetchPatients();
      return true;
    } catch (err) {
      const apiErr = err as ApiError;
      toast.error(getDeleteErrorMessage(apiErr));
      return false;
    }
  }, [fetchPatients]);

  const deleteManyPatients = useCallback(async (ids: string[]): Promise<{ success: number; failed: number }> => {
    if (ids.length === 0) return { success: 0, failed: 0 };
    let success = 0;
    let failed = 0;
    let lastError: ApiError | null = null;
    for (const id of ids) {
      try {
        await api.delete(`/patients/${id}`);
        success++;
      } catch (err) {
        failed++;
        lastError = err as ApiError;
      }
    }
    if (success > 0) {
      toast.success(failed > 0
        ? `${success} paciente(s) excluído(s). ${failed} falharam.`
        : `${success} paciente(s) excluído(s) com sucesso.`);
      await fetchPatients();
    }
    if (failed > 0) {
      toast.error(lastError ? getDeleteErrorMessage(lastError) : "Erro ao excluir pacientes.");
    }
    return { success, failed };
  }, [fetchPatients]);

  return { patients, loading, error, refetch: fetchPatients, createPatient, deletePatient, deleteManyPatients };
}
