import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/services/api";
import { useClinic } from "@/contexts/ClinicContext";

export interface GoogleCalendarStatus {
  connected: boolean;
  lastSyncAt?: string | null;
}

export function useGoogleCalendarIntegration() {
  const { clinicId } = useClinic();
  const [status, setStatus] = useState<GoogleCalendarStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<GoogleCalendarStatus>("/integrations/google-calendar/status");
      setStatus(res ?? { connected: false });
    } catch (err) {
      setError(err as ApiError);
      setStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (clinicId) fetchStatus();
    else {
      setStatus({ connected: false });
      setLoading(false);
    }
  }, [clinicId, fetchStatus]);

  const getAuthUrl = useCallback(async (): Promise<{ url: string } | { error: string }> => {
    try {
      const res = await api.get<{ url: string }>("/integrations/google-calendar/connect");
      const url = res?.url ?? null;
      if (url) return { url };
      return { error: "O backend não retornou a URL de autorização." };
    } catch (err) {
      const apiErr = err as ApiError;
      return { error: apiErr?.message ?? "Não foi possível conectar ao Google Calendar. Verifique se está logado e com clínica selecionada." };
    }
  }, []);

  const disconnect = useCallback(async (): Promise<boolean> => {
    try {
      await api.post("/integrations/google-calendar/disconnect");
      setStatus({ connected: false });
      return true;
    } catch {
      return false;
    }
  }, []);

  return {
    status,
    loading,
    error,
    refetch: fetchStatus,
    getAuthUrl,
    disconnect,
  };
}
