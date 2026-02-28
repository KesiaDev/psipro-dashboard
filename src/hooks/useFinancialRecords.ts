import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface FinancialRecord {
  id: string;
  user_id: string;
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

export function useFinancialRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from("financial_records")
        .select("*, patients(full_name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = (data || []).map((r: any) => ({
        ...r,
        patient_name: r.patients?.full_name || null,
      }));
      setRecords(mapped);
    } catch (err: any) {
      console.error("Error fetching financial records:", err);
      toast.error("Erro ao carregar registros financeiros");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const addRecord = async (input: FinancialRecordInput) => {
    if (!user) return;
    try {
      const { error } = await (supabase as any)
        .from("financial_records")
        .insert({ ...input, user_id: user.id });
      if (error) throw error;
      toast.success("Registro financeiro adicionado");
      await fetchRecords();
    } catch (err: any) {
      console.error("Error adding record:", err);
      toast.error("Erro ao adicionar registro");
    }
  };

  const updateRecord = async (id: string, input: Partial<FinancialRecordInput>) => {
    if (!user) return;
    try {
      const { error } = await (supabase as any)
        .from("financial_records")
        .update(input)
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Registro atualizado");
      await fetchRecords();
    } catch (err: any) {
      console.error("Error updating record:", err);
      toast.error("Erro ao atualizar registro");
    }
  };

  const deleteRecord = async (id: string) => {
    if (!user) return;
    try {
      const { error } = await (supabase as any)
        .from("financial_records")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Registro excluído");
      await fetchRecords();
    } catch (err: any) {
      console.error("Error deleting record:", err);
      toast.error("Erro ao excluir registro");
    }
  };

  // Computed stats
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

  return {
    records,
    loading,
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
