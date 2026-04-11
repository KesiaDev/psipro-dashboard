import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/services/api";
import { REPORTS_CHART_PALETTE } from "@/constants/reportsChart";

export interface ReportsData {
  monthlySessions: { month: string; sessoes: number }[];
  revenueData: { month: string; valor: number }[];
  typeData: { name: string; value: number; color?: string }[];
  topPatients: { name: string; sessions: number; percentage: number }[];
  stats: {
    totalSessions: number;
    activePatients: number;
    returnRate: number;
    avgHoursPerWeek: number;
  };
}

export interface UseReportsDataState {
  data: ReportsData | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

const COLORS = [...REPORTS_CHART_PALETTE];

export function useReportsData(): UseReportsDataState {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{
        monthlySessions?: { month: string; sessions?: number }[];
        revenue?: { month: string; value?: number }[];
        sessionTypes?: { name: string; value?: number }[];
        topPatients?: { name: string; sessions?: number; percentage?: number }[];
        stats?: { totalSessions?: number; activePatients?: number; returnRate?: number; avgHoursPerWeek?: number };
      }>("/reports");
      const r = res as Record<string, unknown>;
      const monthly = (r.monthlySessions ?? r.sessionsByMonth ?? []) as { month: string; sessions?: number }[];
      const revenue = (r.revenue ?? r.revenueData ?? []) as { month: string; value?: number }[];
      const types = (r.sessionTypes ?? r.typeData ?? []) as { name: string; value?: number }[];
      const top = (r.topPatients ?? []) as { name: string; sessions?: number; percentage?: number }[];
      const stats = (r.stats ?? {}) as Record<string, number>;

      const maxSessions = Math.max(...top.map((p) => p.sessions ?? 0), 1);

      setData({
        monthlySessions: monthly.map((m) => ({
          month: m.month?.slice(0, 3) ?? "",
          sessoes: m.sessions ?? 0,
        })),
        revenueData: revenue.map((v) => ({
          month: v.month?.slice(0, 3) ?? "",
          valor: v.value ?? 0,
        })),
        typeData: types.map((t, i) => ({
          name: t.name ?? "",
          value: t.value ?? 0,
          color: COLORS[i % COLORS.length],
        })),
        topPatients: top.map((p) => ({
          name: p.name ?? "—",
          sessions: p.sessions ?? 0,
          percentage: p.percentage ?? Math.round(((p.sessions ?? 0) / maxSessions) * 100),
        })),
        stats: {
          totalSessions: stats.totalSessions ?? 0,
          activePatients: stats.activePatients ?? 0,
          returnRate: stats.returnRate ?? 0,
          avgHoursPerWeek: stats.avgHoursPerWeek ?? 0,
        },
      });
    } catch (err) {
      setError(err as ApiError);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { data, loading, error, refetch: fetchReports };
}
