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

// ─── WhatsApp Business ──────────────────────────────────────────────────────

export interface WhatsAppStatus {
  connected: boolean;
  phoneNumber?: string | null;
  lastSyncAt?: string | null;
}

/** Corpo alinhado ao Nest `POST /api/integrations/whatsapp/connect` (Evolution GO ou Z-API). */
export interface WhatsAppConnectParams {
  provider?: "zapi" | "evolution";
  evolutionApiUrl?: string;
  evolutionInstanceToken?: string;
  /** Nome técnico no Evolution Manager (ex.: TerapeutaClaudiaCruz) */
  evolutionInstanceName?: string;
  instanceId?: string;
  token?: string;
  clientToken?: string;
  phoneNumber?: string;
}

export function useWhatsAppIntegration() {
  const { clinicId } = useClinic();
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<WhatsAppStatus>("/integrations/whatsapp/status");
      setStatus(res ?? { connected: false });
    } catch {
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

  const connect = useCallback(async (params: WhatsAppConnectParams): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await api.post<{ success: boolean; error?: string }>(
        "/integrations/whatsapp/connect",
        params,
      );
      if (res.success) await fetchStatus();
      return res;
    } catch (err) {
      const apiErr = err as ApiError;
      return { success: false, error: apiErr?.message ?? "Erro ao conectar WhatsApp." };
    }
  }, [fetchStatus]);

  const disconnect = useCallback(async (): Promise<boolean> => {
    try {
      await api.delete("/integrations/whatsapp/disconnect");
      setStatus({ connected: false });
      return true;
    } catch {
      return false;
    }
  }, []);

  return { status, loading, refetch: fetchStatus, connect, disconnect };
}
