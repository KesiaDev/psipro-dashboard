import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/services/api";

export interface UseMiniCalendarDaysState {
  daysWithAppointments: number[];
  loading: boolean;
  error: ApiError | null;
  refetch: (year: number, month: number) => Promise<void>;
}

export function useMiniCalendarDays(): UseMiniCalendarDaysState {
  const [daysWithAppointments, setDaysWithAppointments] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const addDaysFromItems = (
    items: { date?: string; scheduled_at?: string; start_at?: string }[],
    year: number,
    month: number,
    daysSet: Set<number>
  ) => {
    for (const a of items) {
      const dateStr = a.date ?? a.scheduled_at ?? a.start_at;
      if (dateStr) {
        const d = new Date(dateStr);
        if (d.getFullYear() === year && d.getMonth() === month) {
          daysSet.add(d.getDate());
        }
      }
    }
  };

  const fetchDays = useCallback(async (year: number, month: number) => {
    setLoading(true);
    setError(null);
    try {
      const start = new Date(year, month, 1).toISOString().slice(0, 10);
      const end = new Date(year, month + 1, 0).toISOString().slice(0, 10);
      const [appointmentsRes, sessionsRes] = await Promise.all([
        api.get<{ appointments?: { date?: string; scheduled_at?: string; start_at?: string }[]; data?: { date?: string; scheduled_at?: string; start_at?: string }[] }>(
          `/appointments?start=${start}&end=${end}`
        ),
        api.get<{ sessions?: { date?: string; scheduled_at?: string; start_at?: string }[]; data?: { date?: string; scheduled_at?: string; start_at?: string }[] }>("/sessions").catch(() => ({ sessions: [], data: [] })),
      ]);
      const aptRaw = appointmentsRes.appointments ?? appointmentsRes.data ?? (Array.isArray(appointmentsRes) ? appointmentsRes : []);
      const sessRaw = sessionsRes.sessions ?? sessionsRes.data ?? (Array.isArray(sessionsRes) ? sessionsRes : []);
      const daysSet = new Set<number>();
      addDaysFromItems(aptRaw as { date?: string; scheduled_at?: string; start_at?: string }[], year, month, daysSet);
      addDaysFromItems(sessRaw as { date?: string; scheduled_at?: string; start_at?: string }[], year, month, daysSet);
      setDaysWithAppointments(Array.from(daysSet));
    } catch (err) {
      setError(err as ApiError);
      setDaysWithAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const now = new Date();
    fetchDays(now.getFullYear(), now.getMonth());
  }, [fetchDays]);

  return { daysWithAppointments, loading, error, refetch: fetchDays };
}
