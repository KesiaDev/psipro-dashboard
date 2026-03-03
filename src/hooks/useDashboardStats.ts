import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/services/api";

export interface DashboardStats {
  patientsCount: number;
  appointmentsToday: number;
  returnRate: number;
  hoursThisWeek: number;
  financialSummary?: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    pending: number;
  };
}

export interface DashboardStatsState {
  data: DashboardStats | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

export function useDashboardStats(): DashboardStatsState {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [patientsRes, appointmentsRes, sessionsRes, financialRes] = await Promise.allSettled([
        api.get<{ count: number }>("/patients/count"),
        api.get<{ count: number; appointments?: unknown[] }>("/appointments/today"),
        api.get<{ returnRate?: number; percentage?: number }>("/sessions/stats"),
        api.get<{ totalIncome?: number; totalExpenses?: number; netProfit?: number; pending?: number }>("/financial/summary"),
      ]);

      const patientsCount = patientsRes.status === "fulfilled" ? patientsRes.value.count : 0;
      const appointmentsData = appointmentsRes.status === "fulfilled" ? appointmentsRes.value : null;
      const appointmentsToday = appointmentsData?.count ?? (Array.isArray(appointmentsData?.appointments) ? appointmentsData.appointments.length : 0);
      const sessionsData = sessionsRes.status === "fulfilled" ? sessionsRes.value : null;
      const returnRate = sessionsData?.returnRate ?? sessionsData?.percentage ?? 0;
      const financialData = financialRes.status === "fulfilled" ? financialRes.value : null;

      let hoursThisWeek = 0;
      if (sessionsRes.status === "fulfilled" && (sessionsRes.value as { hoursThisWeek?: number }).hoursThisWeek !== undefined) {
        hoursThisWeek = (sessionsRes.value as { hoursThisWeek: number }).hoursThisWeek;
      }

      setData({
        patientsCount,
        appointmentsToday: typeof appointmentsToday === "number" ? appointmentsToday : 0,
        returnRate: typeof returnRate === "number" ? returnRate : 0,
        hoursThisWeek,
        financialSummary: financialData
          ? {
              totalIncome: financialData.totalIncome ?? 0,
              totalExpenses: financialData.totalExpenses ?? 0,
              netProfit: financialData.netProfit ?? 0,
              pending: financialData.pending ?? 0,
            }
          : undefined,
      });
    } catch (err) {
      setError(err as ApiError);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { data, loading, error, refetch: fetchStats };
}
