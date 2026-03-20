import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FinancialRecord, FinancialRecordInput } from "@/hooks/useFinancialRecords";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: FinancialRecord | null;
  onSave: (id: string, input: Partial<FinancialRecordInput>) => Promise<void>;
}

export function EditFinancialRecordDialog({ open, onOpenChange, record, onSave }: Props) {
  const [amount, setAmount] = useState<number | "">(0);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [status, setStatus] = useState<FinancialRecordInput["status"]>("pending");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (record && open) {
      setAmount(Number(record.amount) || "");
      setPaymentMethod(record.payment_method ?? null);
      setStatus(record.status);
      setError(null);
    }
  }, [record, open]);

  const handleSave = async () => {
    if (!record) return;
    const amt = amount === "" ? 0 : Number(amount);
    if (status === "paid" && amt <= 0) {
      setError("Informe o valor pago.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSave(record.id, {
        amount: amt,
        payment_method: paymentMethod,
        status,
        paid_at: status === "paid" ? new Date().toISOString() : null,
      });
      onOpenChange(false);
    } catch {
      setError("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar pagamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <p className="font-medium text-foreground">{record.description}</p>
            <p className="text-muted-foreground mt-0.5">{record.patient_name || "—"}</p>
          </div>
          <div className="space-y-2">
            <Label>Valor (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={amount === "" ? "" : amount}
              onChange={(e) => setAmount(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)}
              placeholder="0,00"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Forma de pagamento</Label>
            <Select
              value={paymentMethod || "none"}
              onValueChange={(v) => setPaymentMethod(v === "none" ? null : v)}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Não informado</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="credit_card">Cartão Crédito</SelectItem>
                <SelectItem value="debit_card">Cartão Débito</SelectItem>
                <SelectItem value="bank_transfer">Transferência</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as FinancialRecordInput["status"])}>
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="paid">Pago</SelectItem>
                <SelectItem value="overdue">Atrasado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="gold"
            className="rounded-xl"
            onClick={handleSave}
            disabled={saving || (status === "paid" && (amount === "" || Number(amount) <= 0))}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
