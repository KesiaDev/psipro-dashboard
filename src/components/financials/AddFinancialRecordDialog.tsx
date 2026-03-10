import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import type { FinancialRecordInput } from "@/hooks/useFinancialRecords";
import type { Patient } from "@/hooks/usePatients";

interface Props {
  patients: Patient[];
  onSave: (input: FinancialRecordInput) => Promise<void>;
}

const defaultForm: FinancialRecordInput = {
  type: "income",
  category: "session",
  description: "",
  amount: 0,
  payment_method: null,
  status: "pending",
  due_date: null,
  patient_id: null,
};

export function AddFinancialRecordDialog({ patients, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FinancialRecordInput>({ ...defaultForm });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.description || !form.amount) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
    setForm({ ...defaultForm });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gold" className="rounded-xl gap-2">
          <Plus className="h-4 w-4" /> Novo Registro
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Registro Financeiro</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Tipo</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as any })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Categoria</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="session">Sessão</SelectItem>
                  <SelectItem value="evaluation">Avaliação</SelectItem>
                  <SelectItem value="package">Pacote</SelectItem>
                  <SelectItem value="rent">Aluguel</SelectItem>
                  <SelectItem value="salary">Salário</SelectItem>
                  <SelectItem value="supplies">Material</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Paciente (opcional)</Label>
            <Select value={form.patient_id || "none"} onValueChange={(v) => setForm({ ...form, patient_id: v === "none" ? null : v })}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.full_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Descrição</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Ex: Sessão individual - João Silva"
              className="rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={form.amount || ""}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0,00"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Forma de pagamento</Label>
              <Select value={form.payment_method || "none"} onValueChange={(v) => setForm({ ...form, payment_method: v === "none" ? null : v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="overdue">Atrasado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Vencimento</Label>
              <Input
                type="date"
                value={form.due_date || ""}
                onChange={(e) => setForm({ ...form, due_date: e.target.value || null })}
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button variant="gold" className="rounded-xl" onClick={handleSave} disabled={saving || !form.description || !form.amount}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
