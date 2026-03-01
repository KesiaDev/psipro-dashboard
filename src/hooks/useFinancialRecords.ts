import { useState, useEffect, useCallback } from "react";
import { api, ApiError } from "@/lib/api";
import { toast } from "sonner";

export interface FinancialRecord {
  id: string;
  user_id?: string;
  patient_id: string | null;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  payment_method: string | null;
  status: "paid" | "pending" | "overdue" | "cancelled";
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  patient_name?: string;
}

export interface FinancialRecordInput {
  patient_id?: string | null;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: number;
  payment_method?: string | null;
  status: "paid" | "pending" | "overdue" | "cancelled";
  due_date?: string | null;
  paid_at?: string | null;
}

export interface UseFinancialRecordsState {
  records: FinancialRecord[];
  loading: boolean;
  error: ApiError | null;
  addRecord: (input: FinancialRecordInput) => Promise<void>;
  updateRecord: (id: string, input: Partial<FinancialRecordInput>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
  stats: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    totalPending: number;
    totalOverdue: number;
  };
}

function mapRecord(raw: Record<string, unknown>): FinancialRecord {
  return {
    id: String(raw.id ?? ""),
    patient_id: raw.patient_id != null ? String(raw.patient_id) : null,
    type: ((raw.type as string) ?? "income") as "income" | "expense",
    category: (raw.category as string) ?? "",
    description: (raw.description as string) ?? "",
    amount: Number(raw.amount ?? 0),
    payment_method: (raw.payment_method as string) ?? null,
    status: ((raw.status as string) ?? "pending") as FinancialRecord["status"],
    due_date: (raw.due_date as string) ?? null,
    paid_at: (raw.paid_at as string) ?? null,
    created_at: (raw.created_at as string) ?? (raw.createdAt as string) ?? "",
    updated_at: (raw.updated_at as string) ?? (raw.updatedAt as string) ?? "",
    patient_name: (raw.patient_name as string) ?? (raw.patient?.full_name as string) ?? (raw.patient?.name as string),
  };
}

export function useFinancialRecords(): UseFinancialRecordsState {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ records?: Record<string, unknown>[]; data?: Record<string, unknown>[] }>("/financial/records");
      const raw = res.records ?? res.data ?? (Array.isArray(res) ? res : []);
      setRecords(raw.map((r: Record<string, unknown>) => mapRecord(r)));
    } catch (err) {
      setError(err as ApiError);
      setRecords([]);
      toast.error("Erro ao carregar registros financeiros");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const totalIncome = records
    .filter((r) => r.type === "income" && r.status === "paid")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const totalExpenses = records
    .filter((r) => r.type === "expense" && r.status === "paid")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const totalPending = records
    .filter((r) => r.status === "pending")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const totalOverdue = records
    .filter((r) => r.status === "overdue")
    .reduce((sum, r) => sum + Number(r.amount), 0);

  const addRecord = useCallback(async (input: FinancialRecordInput) => {
    try {
      await api.post("/financial/records", input);
      toast.success("Registro financeiro adicionado");
      await fetchRecords();
    } catch (err) {
      toast.error("Erro ao adicionar registro");
      throw err;
    }
  }, [fetchRecords]);

  const updateRecord = useCallback(async (id: string, input: Partial<FinancialRecordInput>) => {
    try {
      await api.patch(`/financial/records/${id}`, input);
      toast.success("Registro atualizado");
      await fetchRecords();
    } catch (err) {
      toast.error("Erro ao atualizar registro");
      throw err;
    }
  }, [fetchRecords]);

  const deleteRecord = useCallback(async (id: string) => {
    try {
      await api.delete(`/financial/records/${id}`);
      toast.success("Registro excluído");
      await fetchRecords();
    } catch (err) {
      toast.error("Erro ao excluir registro");
      throw err;
    }
  }, [fetchRecords]);

  return {
    records,
    loading,
    error,
    addRecord,
    updateRecord,
    deleteRecord,
    refetch: fetchRecords,
    stats: {
      totalIncome,
      totalExpenses,
      netProfit: totalIncome - totalExpenses,
      totalPending,
      totalOverdue,
    },
  };
}
