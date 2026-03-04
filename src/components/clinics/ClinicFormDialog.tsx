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
import { api } from "@/services/api";
import { toast } from "sonner";
import type { Clinic, CreateClinicInput } from "@/hooks/useClinics";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clinic?: Clinic | null;
  onCreate: (input: CreateClinicInput) => Promise<unknown>;
  onUpdate: (id: string, input: Partial<CreateClinicInput>) => Promise<boolean>;
}

const defaultForm: CreateClinicInput = {
  name: "",
  address: "",
  phone: "",
  email: "",
  plan: "",
};

export function ClinicFormDialog({ open, onOpenChange, clinic, onCreate, onUpdate }: Props) {
  const isEdit = !!clinic;
  const [form, setForm] = useState<CreateClinicInput>({ ...defaultForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(
        clinic
          ? {
              name: clinic.name,
              address: clinic.address,
              phone: clinic.phone,
              email: clinic.email,
              plan: clinic.plan ?? "",
            }
          : { ...defaultForm }
      );
      setError(null);
    }
  }, [open, clinic]);

  const validate = (): boolean => {
    if (!form.name?.trim()) {
      setError("Nome é obrigatório.");
      return false;
    }
    if (!form.email?.trim()) {
      setError("E-mail é obrigatório.");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit && clinic) {
        const ok = await onUpdate(clinic.id, form);
        if (ok) onOpenChange(false);
      } else {
        const result = await onCreate(form);
        if (result) onOpenChange(false);
      }
    } catch {
      setError("Erro ao salvar.");
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
          <DialogTitle>{isEdit ? "Editar Clínica" : "Nova Clínica"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nome da clínica"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Endereço</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Endereço completo"
              className="rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(11) 99999-9999"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@clinica.com"
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Plano</Label>
            <Input
              value={form.plan ?? ""}
              onChange={(e) => setForm({ ...form, plan: e.target.value })}
              placeholder="Ex: Básico, Premium"
              className="rounded-xl"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" className="rounded-xl" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="gold"
            className="rounded-xl"
            onClick={handleSave}
            disabled={saving || !form.name?.trim() || !form.email?.trim()}
          >
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
