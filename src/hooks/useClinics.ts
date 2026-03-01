import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";

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

export interface UseClinicsState {
  clinics: Clinic[];
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

export function useClinics(): UseClinicsState {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchClinics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
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
    fetchClinics();
  }, [fetchClinics]);

  return { clinics, loading, error, refetch: fetchClinics };
}
