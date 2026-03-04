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
import type { Professional, CreateProfessionalInput } from "@/hooks/useProfessionals";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professional?: Professional | null;
  clinicId: string | undefined;
  onCreate: (input: CreateProfessionalInput) => Promise<unknown>;
  onUpdate: (id: string, input: Partial<CreateProfessionalInput>) => Promise<boolean>;
}

const defaultForm: CreateProfessionalInput = {
  name: "",
  crp: "",
  specialty: "",
  email: "",
  phone: "",
};

export function ProfessionalFormDialog({ open, onOpenChange, professional, clinicId, onCreate, onUpdate }: Props) {
  const isEdit = !!professional;
  const [form, setForm] = useState<CreateProfessionalInput>({ ...defaultForm });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(
        professional
          ? {
              name: professional.name,
              crp: professional.crp,
              specialty: professional.specialty,
              email: professional.email,
              phone: professional.phone,
              clinic_id: professional.clinicId,
            }
          : { ...defaultForm, clinic_id: clinicId }
      );
      setError(null);
    }
  }, [open, professional, clinicId]);

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
      if (isEdit && professional) {
        const ok = await onUpdate(professional.id, form);
        if (ok) onOpenChange(false);
      } else {
        const result = await onCreate({ ...form, clinic_id: clinicId });
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
          <DialogTitle>{isEdit ? "Editar Profissional" : "Adicionar Profissional"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Nome completo"
              className="rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>CRP</Label>
              <Input
                value={form.crp}
                onChange={(e) => setForm({ ...form, crp: e.target.value })}
                placeholder="06/12345"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Especialidade</Label>
              <Input
                value={form.specialty}
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
                placeholder="Ex: TCC"
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>E-mail *</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="email@exemplo.com"
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="(11) 99999-9999"
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
