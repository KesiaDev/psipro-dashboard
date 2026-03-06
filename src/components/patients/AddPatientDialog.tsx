import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CreatePatientInput } from "@/hooks/usePatients";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (input: CreatePatientInput) => Promise<unknown>;
}

const defaultForm: CreatePatientInput = {
  full_name: "",
  email: null,
  phone: null,
  date_of_birth: null,
  cpf: null,
  notes: null,
  status: "active",
};

export function AddPatientDialog({ open, onOpenChange, onSave }: Props) {
  const [form, setForm] = useState<CreatePatientInput>({ ...defaultForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!form.full_name?.trim()) {
      setError("Nome é obrigatório.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const result = await onSave(form);
      if (result) {
        setForm({ ...defaultForm });
        onOpenChange(false);
      } else {
        setError("Não foi possível criar o paciente.");
      }
    } catch {
      setError("Erro ao criar paciente.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) setError(null);
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Paciente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="patient-name" className="text-sm text-muted-foreground">Nome completo *</Label>
            <Input
              id="patient-name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Ex: Ana Souza"
              className="rounded-xl"
              aria-required="true"
              aria-label="Nome completo do paciente"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="patient-email" className="text-sm text-muted-foreground">E-mail</Label>
            <Input
              id="patient-email"
              type="email"
              value={form.email ?? ""}
              onChange={(e) => setForm({ ...form, email: e.target.value || null })}
              placeholder="email@exemplo.com"
              className="rounded-xl"
              aria-label="E-mail do paciente"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="patient-phone" className="text-sm text-muted-foreground">Telefone</Label>
            <Input
              id="patient-phone"
              value={form.phone ?? ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value || null })}
              placeholder="(11) 99999-9999"
              className="rounded-xl"
              aria-label="Telefone do paciente"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="patient-status" className="text-sm text-muted-foreground">Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as CreatePatientInput["status"] })}
              aria-label="Status do paciente"
            >
              <SelectTrigger id="patient-status" className="rounded-xl" aria-label="Selecionar status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="new">Novo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" className="rounded-xl" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              variant="gold"
              className="rounded-xl"
              onClick={handleSave}
              disabled={saving || !form.full_name?.trim()}
            >
              {saving ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
