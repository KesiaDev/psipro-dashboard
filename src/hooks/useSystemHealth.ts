import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";

export interface HealthCheckItem {
  ok: boolean;
  label?: string;
  latencyMs?: number;
}

export interface SystemHealthResponse {
  status?: "operational" | "healthy" | "degraded" | "down" | "error" | "ok";
  backend?: string | { status?: string; latencyMs?: number };
  database?: string | { status?: string; latencyMs?: number };
  web?: string | { status?: string; latencyMs?: number };
  mobileSync?: string | { status?: string; latencyMs?: number };
  apiLatencyMs?: number;
  apiLatency?: number;
  latency?: number;
  uptime?: number | string;
  version?: string;
  checks?: Record<string, { status?: string; latencyMs?: number }>;
}

export interface LatencyRecord {
  index: number;
  api: number;
  database: number;
  web: number;
}

const LATENCY_HISTORY_MAX = 30;

export interface SystemHealthState {
  backend: HealthCheckItem;
  database: HealthCheckItem;
  web: HealthCheckItem;
  mobileSync: HealthCheckItem;
  apiLatencyMs: number;
  overallStatus: "operational" | "degraded" | "down";
  uptime: string | null;
  version: string | null;
  latencyHistory: LatencyRecord[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/** Converte segundos em "Xh Ym" ou "Xm" ou "Xs" */
export function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const mins = m % 60;
  if (h < 24) return `${h}h ${mins}m`;
  const d = Math.floor(h / 24);
  const hrs = h % 24;
  return `${d}d ${hrs}h ${mins}m`;
}

function parseCheck(
  value: string | { status?: string; latencyMs?: number } | undefined
): HealthCheckItem {
  if (!value) return { ok: false };
  if (typeof value === "string") {
    const ok = /^(ok|up|healthy|operational)$/i.test(value);
    return { ok };
  }
  const status = value.status ?? "";
  const ok = /^(ok|up|healthy|operational)$/i.test(status);
  return {
    ok,
    latencyMs: value.latencyMs,
  };
}

export function useSystemHealth(): SystemHealthState {
  const [backend, setBackend] = useState<HealthCheckItem>({ ok: false });
  const [database, setDatabase] = useState<HealthCheckItem>({ ok: false });
  const [web, setWeb] = useState<HealthCheckItem>({ ok: false });
  const [mobileSync, setMobileSync] = useState<HealthCheckItem>({ ok: false });
  const [apiLatencyMs, setApiLatencyMs] = useState(0);
  const [overallStatus, setOverallStatus] = useState<"operational" | "degraded" | "down">("down");
  const [uptime, setUptime] = useState<string | null>(null);
  const [version, setVersion] = useState<string | null>(null);
  const [latencyHistory, setLatencyHistory] = useState<LatencyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    const start = performance.now();
    try {
      let res: SystemHealthResponse;
      try {
        res = await api.get<SystemHealthResponse>("/health");
      } catch {
        res = await api.get<SystemHealthResponse>("/system-health");
      }
      const latency = Math.round(performance.now() - start);

      // Parse from flat structure (NestJS /health ou /system-health)
      const backendVal = res.backend ?? res.checks?.backend;
      const databaseVal = res.database ?? res.checks?.database;
      const webVal = res.web ?? res.checks?.web;
      const mobileSyncVal = res.mobileSync ?? res.checks?.mobileSync;

      const backendCheck = parseCheck(backendVal);
      const databaseCheck = parseCheck(databaseVal);
      const webCheck = parseCheck(webVal);
      const mobileSyncCheck = parseCheck(mobileSyncVal);

      setBackend(
        backendCheck.latencyMs == null
          ? { ...backendCheck, latencyMs: latency }
          : backendCheck
      );
      setDatabase(databaseCheck);
      setWeb(webCheck);
      setMobileSync(mobileSyncCheck);

      const latencyVal =
        res.apiLatencyMs ?? res.apiLatency ?? res.latency ?? latency;
      setApiLatencyMs(typeof latencyVal === "number" ? latencyVal : 0);

      const status = (res.status ?? "").toLowerCase();
      if (/^(operational|healthy|ok)$/.test(status)) {
        setOverallStatus("operational");
      } else if (/^(degraded|warning)$/.test(status)) {
        setOverallStatus("degraded");
      } else {
        const okCount = [
          parseCheck(backendVal),
          parseCheck(databaseVal),
          parseCheck(webVal),
          parseCheck(mobileSyncVal),
        ].filter((c) => c.ok).length;
        setOverallStatus(
          okCount === 4 ? "operational" : okCount > 0 ? "degraded" : "down"
        );
      }

      setUptime(
        res.uptime != null
          ? typeof res.uptime === "string"
            ? res.uptime
            : formatUptime(res.uptime)
          : null
      );
      setVersion(res.version ?? null);

      const apiLat = typeof latencyVal === "number" ? latencyVal : latency;
      const dbLat = databaseCheck.latencyMs ?? (databaseCheck.ok ? latency : 0);
      const webLat = webCheck.latencyMs ?? (webCheck.ok ? latency : 0);

      setLatencyHistory((prev) => {
        const next: LatencyRecord[] = [
          ...prev,
          {
            index: prev.length > 0 ? prev[prev.length - 1].index + 1 : 1,
            api: apiLat,
            database: dbLat,
            web: webLat,
          },
        ];
        return next.slice(-LATENCY_HISTORY_MAX);
      });
    } catch (err) {
      setError((err as { message?: string })?.message ?? "Falha ao verificar saúde do sistema");
      setBackend({ ok: false });
      setDatabase({ ok: false });
      setWeb({ ok: false });
      setMobileSync({ ok: false });
      setApiLatencyMs(0);
      setOverallStatus("down");
      setUptime(null);
      setVersion(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30_000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return {
    backend,
    database,
    web,
    mobileSync,
    apiLatencyMs,
    overallStatus,
    uptime,
    version,
    latencyHistory,
    loading,
    error,
    refetch: fetchHealth,
  };
}
