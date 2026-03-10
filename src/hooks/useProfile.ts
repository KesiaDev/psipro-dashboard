import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/services/api";
import { toast } from "sonner";

export interface Profile {
  id?: string;
  name: string;
  email: string;
  phone: string;
  crp?: string;
  professionalType?: string;
  specialties?: string;
  avatar_url?: string;
}

export interface ProfileSchedule {
  [day: string]: { start: string; end: string; enabled: boolean };
}

export interface UseProfileState {
  profile: Profile | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
  updateProfile: (input: Partial<Profile>) => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

function mapProfile(raw: Record<string, unknown>): Profile {
  return {
    id: raw.id != null ? String(raw.id) : undefined,
    name: (raw.name as string) ?? (raw.full_name as string) ?? "",
    email: (raw.email as string) ?? "",
    phone: (raw.phone as string) ?? "",
    crp: (raw.crp as string) ?? undefined,
    professionalType: (raw.professionalType as string) ?? (raw.professional_type as string) ?? undefined,
    specialties: (raw.specialties as string) ?? (raw.specialty as string) ?? undefined,
    avatar_url: (raw.avatar_url as string) ?? undefined,
  };
}

export function useProfile(): UseProfileState {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Record<string, unknown>>("/users/me");
      const data = (res?.user ?? res?.data ?? res) as Record<string, unknown>;
      setProfile(mapProfile(data ?? {}));
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr);
      if (apiErr?.status === 404) {
        setProfile({ name: "", email: "", phone: "" });
        setError(null);
      } else {
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (input: Partial<Profile>): Promise<boolean> => {
    try {
      const res = await api.put<Record<string, unknown>>("/users/me", input);
      const data = (res?.user ?? res?.data ?? res) as Record<string, unknown>;
      setProfile(data ? mapProfile(data) : { ...profile!, ...input });
      toast.success("Perfil atualizado com sucesso");
      return true;
    } catch {
      toast.error("Erro ao atualizar perfil");
      return false;
    }
  }, [profile]);

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      await api.put("/users/password", { currentPassword, newPassword });
      toast.success("Senha atualizada com sucesso");
      return true;
    } catch {
      toast.error("Erro ao atualizar senha");
      return false;
    }
  }, []);

  return { profile, loading, error, refetch: fetchProfile, updateProfile, updatePassword };
}
