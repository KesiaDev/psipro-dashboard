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
import { api } from "@/services/api";
import { toast } from "sonner";
import type { Patient } from "@/hooks/usePatients";

export interface EditPatientInput {
  full_name: string;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  status: "active" | "inactive" | "new";
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  patientData: Patient;
  onSuccess?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toDateInputValue(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

export function EditPatientModal({ open, onOpenChange, patientId, patientData, onSuccess }: Props) {
  const [form, setForm] = useState<EditPatientInput>({
    full_name: patientData?.full_name ?? patientData?.name ?? "",
    email: patientData?.email ?? null,
    phone: patientData?.phone ?? null,
    date_of_birth: patientData?.date_of_birth ?? null,
    gender: (patientData as Patient & { gender?: string })?.gender ?? null,
    status: patientData?.status ?? "active",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && patientData) {
      setForm({
        full_name: patientData.full_name ?? patientData.name ?? "",
        email: patientData.email ?? null,
        phone: patientData.phone ?? null,
        date_of_birth: patientData.date_of_birth ?? null,
        gender: (patientData as Patient & { gender?: string })?.gender ?? null,
        status: patientData.status ?? "active",
      });
      setError(null);
    }
  }, [open, patientData]);

  const validate = (): boolean => {
    if (!form.full_name?.trim()) {
      setError("Nome é obrigatório.");
      return false;
    }
    if (form.email?.trim()) {
      if (!EMAIL_REGEX.test(form.email.trim())) {
        setError("E-mail inválido.");
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await api.put(`/patients/${patientId}`, {
        full_name: form.full_name.trim(),
        email: form.email?.trim() || null,
        phone: form.phone?.trim() || null,
        date_of_birth: form.date_of_birth || null,
        gender: form.gender || null,
        status: form.status,
      });
      toast.success("Paciente atualizado com sucesso");
      onOpenChange(false);
      onSuccess?.();
    } catch {
      setError("Erro ao atualizar paciente.");
      toast.error("Erro ao atualizar paciente");
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
          <DialogTitle>Editar paciente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Nome *</Label>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Nome completo"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Email</Label>
            <Input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => setForm({ ...form, email: e.target.value || null })}
              placeholder="email@exemplo.com"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Telefone</Label>
            <Input
              value={form.phone ?? ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value || null })}
              placeholder="(11) 99999-9999"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Data de nascimento</Label>
            <Input
              type="date"
              value={toDateInputValue(form.date_of_birth)}
              onChange={(e) => setForm({ ...form, date_of_birth: e.target.value || null })}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Gênero</Label>
            <Select
              value={form.gender ?? "_empty"}
              onValueChange={(v) => setForm({ ...form, gender: v === "_empty" ? null : v })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_empty">Selecione</SelectItem>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Feminino</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
                <SelectItem value="prefer_not">Não informar</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Status</Label>
            <Select
              value={form.status}
              onValueChange={(v) => setForm({ ...form, status: v as EditPatientInput["status"] })}
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="new">Novo</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter className="gap-2 sm:gap-0 pt-2">
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
