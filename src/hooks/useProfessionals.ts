import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/services/api";

export interface Professional {
  id: string;
  name: string;
  crp: string;
  specialty: string;
  email: string;
  phone: string;
  avatar: string;
  status: "active" | "inactive" | "vacation";
  patientsCount: number;
  sessionsThisMonth: number;
  clinicId: string;
}

export interface UseProfessionalsState {
  professionals: Professional[];
  loading: boolean;
  error: ApiError | null;
  refetch: (clinicId?: string) => Promise<void>;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function useProfessionals(clinicId?: string): UseProfessionalsState {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchProfessionals = useCallback(async (cid?: string) => {
    const id = cid ?? clinicId;
    setLoading(true);
    setError(null);
    try {
      const endpoint = id ? `/clinics/${id}/professionals` : "/professionals";
      const res = await api.get<{ professionals?: Record<string, unknown>[]; data?: Record<string, unknown>[] }>(endpoint);
      const raw = res.professionals ?? res.data ?? (Array.isArray(res) ? res : []);
      const mapped: Professional[] = raw.map((p: Record<string, unknown>) => ({
        id: String(p.id ?? ""),
        name: (p.name as string) ?? (p.full_name as string) ?? "",
        crp: (p.crp as string) ?? "",
        specialty: (p.specialty as string) ?? "",
        email: (p.email as string) ?? "",
        phone: (p.phone as string) ?? "",
        avatar: (p.avatar as string) ?? getInitials((p.name as string) ?? (p.full_name as string) ?? ""),
        status: ((p.status as string) ?? "active") as Professional["status"],
        patientsCount: Number(p.patientsCount ?? p.patients_count ?? 0),
        sessionsThisMonth: Number(p.sessionsThisMonth ?? p.sessions_this_month ?? 0),
        clinicId: String(p.clinicId ?? p.clinic_id ?? id ?? ""),
      }));
      setProfessionals(mapped);
    } catch (err) {
      setError(err as ApiError);
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchProfessionals(clinicId);
  }, [fetchProfessionals, clinicId]);

  return { professionals, loading, error, refetch: fetchProfessionals };
}
