import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/services/api";
import { useClinic } from "@/contexts/ClinicContext";

export interface DashboardStats {
  patientsCount: number;
  appointmentsToday: number;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
  hoursThisWeek: number;
  financialSummary?: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    pending: number;
    receitaMes: number;
    totalAReceber: number;
  };
}

export interface DashboardStatsState {
  data: DashboardStats | null;
  loading: boolean;
  error: ApiError | null;
  refetch: () => Promise<void>;
}

export function useDashboardStats(): DashboardStatsState {
  const { clinicId } = useClinic();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const [patientsRes, appointmentsRes, sessionsRes, financialRes, allAppointmentsRes] = await Promise.allSettled([
        api.get<unknown>("/patients/count"),
        api.get<{ count: number; appointments?: unknown[]; data?: unknown[]; items?: unknown[] }>("/appointments/today"),
        api.get<{ sessionsThisWeek?: number; sessionsThisMonth?: number; hoursThisWeek?: number; returnRate?: number }>("/sessions/stats"),
        api.get<{ totalIncome?: number; totalExpenses?: number; netProfit?: number; pending?: number; receitaMes?: number; totalAReceber?: number }>("/financial/summary"),
        api.get<unknown[]>(`/appointments?start=${today}&end=${today}`),
      ]);

      // patients count — API may return raw number or {count: N}
      const patientsRaw = patientsRes.status === "fulfilled" ? patientsRes.value : 0;
      const patientsCount = typeof patientsRaw === "number" ? patientsRaw : (patientsRaw as { count?: number })?.count ?? 0;

      // appointments today — /today endpoint has timezone issue, fallback to date-filtered list
      const todayData = appointmentsRes.status === "fulfilled" ? appointmentsRes.value : null;
      const todayFromEndpoint = todayData?.count ?? (Array.isArray(todayData?.appointments) ? todayData.appointments.length : 0) ?? (Array.isArray(todayData?.data) ? todayData.data.length : 0);
      const allAptRaw = allAppointmentsRes.status === "fulfilled" ? allAppointmentsRes.value : [];
      const allAptArr = Array.isArray(allAptRaw) ? allAptRaw : [];
      const appointmentsToday = allAptArr.length > 0 ? allAptArr.length : (typeof todayFromEndpoint === "number" ? todayFromEndpoint : 0);

      const sessionsData = sessionsRes.status === "fulfilled" ? sessionsRes.value : null;
      const sessionsThisWeek = sessionsData?.sessionsThisWeek ?? 0;
      const sessionsThisMonth = sessionsData?.sessionsThisMonth ?? 0;
      const hoursThisWeek = sessionsData?.hoursThisWeek ?? sessionsThisWeek; // fallback: 1 sessão ≈ 1h

      const financialData = financialRes.status === "fulfilled" ? financialRes.value : null;

      setData({
        patientsCount,
        appointmentsToday,
        sessionsThisWeek,
        sessionsThisMonth,
        hoursThisWeek,
        financialSummary: financialData
          ? {
              totalIncome: financialData.totalIncome ?? 0,
              totalExpenses: financialData.totalExpenses ?? 0,
              netProfit: financialData.netProfit ?? 0,
              pending: financialData.pending ?? 0,
              receitaMes: financialData.receitaMes ?? 0,
              totalAReceber: financialData.totalAReceber ?? 0,
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
    if (clinicId) {
      fetchStats();
    } else {
      setLoading(true);
      setData(null);
      setError(null);
    }
  }, [clinicId, fetchStats]);

  return { data, loading, error, refetch: fetchStats };
}
