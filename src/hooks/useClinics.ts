import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  professionals: number;
  patients: number;
  status: "active" | "inactive";
  plan: string;
  createdAt: string;
}

export interface CreateClinicInput {
  name: string;
  address: string;
  phone: string;
  email: string;
  plan?: string;
}

export interface UseClinicsState {
  clinics: Clinic[];
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
  createClinic: (input: CreateClinicInput) => Promise<Clinic | null>;
  updateClinic: (id: string, input: Partial<CreateClinicInput>) => Promise<boolean>;
  updateClinicStatus: (id: string, status: "active" | "inactive") => Promise<boolean>;
}

export function useClinics(): UseClinicsState {
  const { session } = useAuth();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchClinics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // IMPORTANTE: O backend deve retornar APENAS clínicas do usuário autenticado
      // (onde ele é proprietário ou foi adicionado como profissional)
      const res = await api.get<{ clinics?: Clinic[]; data?: Clinic[] }>("/clinics");
      const raw = res.clinics ?? res.data ?? (Array.isArray(res) ? res : []);
      const mapped: Clinic[] = raw.map((c: Record<string, unknown>) => ({
        id: String(c.id ?? ""),
        name: (c.name as string) ?? "",
        address: (c.address as string) ?? "",
        phone: (c.phone as string) ?? "",
        email: (c.email as string) ?? "",
        professionals: Number(c.professionals ?? 0),
        patients: Number(c.patients ?? 0),
        status: ((c.status as string) ?? "active") as "active" | "inactive",
        plan: (c.plan as string) ?? "",
        createdAt: (c.createdAt as string) ?? (c.created_at as string) ?? "",
      }));
      setClinics(mapped);
    } catch (err) {
      setError(err as ApiError);
      setClinics([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.access_token) {
      fetchClinics();
    } else {
      setLoading(false);
      setError(null);
      setClinics([]);
    }
  }, [session?.access_token, fetchClinics]);

  const createClinic = useCallback(async (input: CreateClinicInput): Promise<Clinic | null> => {
    try {
      const res = await api.post<Clinic | Record<string, unknown>>("/clinics", input);
      toast.success("Clínica criada com sucesso");
      await fetchClinics();
      const c = (res as Record<string, unknown>) ?? {};
      return {
        id: String(c.id ?? ""),
        name: (c.name as string) ?? input.name,
        address: (c.address as string) ?? input.address,
        phone: (c.phone as string) ?? input.phone,
        email: (c.email as string) ?? input.email,
        professionals: Number(c.professionals ?? 0),
        patients: Number(c.patients ?? 0),
        status: ((c.status as string) ?? "active") as "active" | "inactive",
        plan: (c.plan as string) ?? input.plan ?? "",
        createdAt: (c.createdAt as string) ?? (c.created_at as string) ?? "",
      };
    } catch {
      toast.error("Erro ao criar clínica");
      return null;
    }
  }, [fetchClinics]);

  const updateClinic = useCallback(async (id: string, input: Partial<CreateClinicInput>): Promise<boolean> => {
    try {
      await api.put(`/clinics/${id}`, input);
      toast.success("Clínica atualizada com sucesso");
      await fetchClinics();
      return true;
    } catch {
      toast.error("Erro ao atualizar clínica");
      return false;
    }
  }, [fetchClinics]);

  const updateClinicStatus = useCallback(async (id: string, status: "active" | "inactive"): Promise<boolean> => {
    try {
      await api.patch(`/clinics/${id}/status`, { status });
      toast.success(status === "active" ? "Clínica ativada" : "Clínica desativada");
      await fetchClinics();
      return true;
    } catch {
      toast.error("Erro ao atualizar status");
      return false;
    }
  }, [fetchClinics]);

  return { clinics, loading, error, refetch: fetchClinics, createClinic, updateClinic, updateClinicStatus };
}
