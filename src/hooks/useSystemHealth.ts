import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";

export interface HealthCheckResult {
  ok: boolean;
  latencyMs?: number;
  error?: string;
}

export interface SystemHealthState {
  backendApi: HealthCheckResult;
  database: HealthCheckResult;
  mobileSync: HealthCheckResult;
  webSync: HealthCheckResult;
  overallStatus: "healthy" | "degraded" | "down";
  averageLatencyMs: number;
  loading: boolean;
  refetch: () => Promise<void>;
}

const CHECK_INTERVAL_MS = 30_000;

async function checkEndpoint(path: string): Promise<HealthCheckResult> {
  const start = performance.now();
  try {
    await api.get(path);
    const latencyMs = Math.round(performance.now() - start);
    return { ok: true, latencyMs };
  } catch (err: unknown) {
    const e = err as { message?: string; status?: number };
    return {
      ok: false,
      latencyMs: Math.round(performance.now() - start),
      error: e?.message ?? "Erro desconhecido",
    };
  }
}

export function useSystemHealth(): SystemHealthState {
  const [backendApi, setBackendApi] = useState<HealthCheckResult>({ ok: false });
  const [database, setDatabase] = useState<HealthCheckResult>({ ok: false });
  const [mobileSync, setMobileSync] = useState<HealthCheckResult>({ ok: false });
  const [webSync, setWebSync] = useState<HealthCheckResult>({ ok: false });
  const [loading, setLoading] = useState(true);

  const runChecks = useCallback(async () => {
    setLoading(true);
    const [patientsRes, appointmentsRes, sessionsRes, financialRes] = await Promise.all([
      checkEndpoint("/patients?limit=1"),
      checkEndpoint("/appointments?limit=1"),
      checkEndpoint("/sessions?limit=1"),
      checkEndpoint("/financial/records?limit=1"),
    ]);

    setBackendApi(patientsRes);
    setDatabase(appointmentsRes);
    setMobileSync(sessionsRes);
    setWebSync(financialRes);
    setLoading(false);
  }, []);

  useEffect(() => {
    runChecks();
    const interval = setInterval(runChecks, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [runChecks]);

  const results = [backendApi, database, mobileSync, webSync];
  const okCount = results.filter((r) => r.ok).length;
  const overallStatus: "healthy" | "degraded" | "down" =
    okCount === 4 ? "healthy" : okCount > 0 ? "degraded" : "down";

  const latencies = results.filter((r) => r.latencyMs != null).map((r) => r.latencyMs!);
  const averageLatencyMs =
    latencies.length > 0 ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : 0;

  return {
    backendApi,
    database,
    mobileSync,
    webSync,
    overallStatus,
    averageLatencyMs,
    loading,
    refetch: runChecks,
  };
}
