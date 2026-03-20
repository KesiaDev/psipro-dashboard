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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CreatePatientInput, PatientIntakeData } from "@/hooks/usePatients";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (input: CreatePatientInput) => Promise<unknown>;
}

const defaultIntake: PatientIntakeData = {
  main_complaint: null,
  reason_consultation: null,
  previous_diseases: null,
  medications: null,
  allergies: null,
  family_history: null,
  diet: null,
  physical_activity: null,
  smoking: null,
  alcohol: null,
  exams_done: null,
  exam_results: null,
};

const defaultForm: CreatePatientInput = {
  full_name: "",
  email: null,
  phone: null,
  date_of_birth: null,
  cpf: null,
  notes: null,
  status: "active",
  gender: null,
  profession: null,
  intake: defaultIntake,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground border-b border-border pb-1.5">{title}</h3>
      {children}
    </div>
  );
}

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
    } catch (err) {
      const msg = (err as { message?: string })?.message ?? "Erro ao criar paciente.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) setError(null);
    onOpenChange(newOpen);
  };

  const updateIntake = (key: keyof PatientIntakeData, value: string | null) => {
    setForm((prev) => ({
      ...prev,
      intake: { ...(prev.intake ?? defaultIntake), [key]: value },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Paciente</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 mt-2">
          <Section title="Dados de Identificação">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="patient-name">Nome completo *</Label>
                <Input
                  id="patient-name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Ex: Ana Souza"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-birth">Data de nascimento</Label>
                <Input
                  id="patient-birth"
                  type="date"
                  value={form.date_of_birth ?? ""}
                  onChange={(e) => setForm({ ...form, date_of_birth: e.target.value || null })}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-age">Idade</Label>
                <Input
                  id="patient-age"
                  type="number"
                  min="0"
                  max="150"
                  placeholder="Anos"
                  className="rounded-xl"
                  readOnly
                  value={
                    form.date_of_birth
                      ? Math.max(
                          0,
                          Math.floor(
                            (Date.now() - new Date(form.date_of_birth).getTime()) /
                              (365.25 * 24 * 60 * 60 * 1000)
                          )
                        ) || ""
                      : ""
                  }
                />
                <p className="text-xs text-muted-foreground">Calculada pela data de nascimento</p>
              </div>
              <div className="space-y-2">
                <Label>Sexo</Label>
                <Select
                  value={form.gender ?? "_empty"}
                  onValueChange={(v) => setForm({ ...form, gender: v === "_empty" ? null : v })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_empty">Nenhum</SelectItem>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                    <SelectItem value="other">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-profession">Profissão</Label>
                <Input
                  id="patient-profession"
                  value={form.profession ?? ""}
                  onChange={(e) => setForm({ ...form, profession: e.target.value || null })}
                  placeholder="Ex: Professora"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-email">E-mail</Label>
                <Input
                  id="patient-email"
                  type="email"
                  value={form.email ?? ""}
                  onChange={(e) => setForm({ ...form, email: e.target.value || null })}
                  placeholder="email@exemplo.com"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="patient-phone">Contato</Label>
                <Input
                  id="patient-phone"
                  value={form.phone ?? ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value || null })}
                  placeholder="(11) 99999-9999"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm({ ...form, status: v as CreatePatientInput["status"] })}
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
            </div>
          </Section>

          <Section title="Queixa Principal">
            <div className="space-y-2">
              <Label htmlFor="main-complaint">Descreva o motivo da consulta</Label>
              <Textarea
                id="main-complaint"
                value={form.intake?.main_complaint ?? ""}
                onChange={(e) => updateIntake("main_complaint", e.target.value || null)}
                placeholder="Queixa principal do paciente..."
                className="rounded-xl min-h-[80px]"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason-consultation">Motivo da consulta (detalhes)</Label>
              <Textarea
                id="reason-consultation"
                value={form.intake?.reason_consultation ?? ""}
                onChange={(e) => updateIntake("reason_consultation", e.target.value || null)}
                placeholder="Detalhes adicionais..."
                className="rounded-xl min-h-[60px]"
                rows={2}
              />
            </div>
          </Section>

          <Section title="Histórico de Saúde">
            <div className="space-y-2">
              <Label htmlFor="previous-diseases">Doenças prévias (cirurgias, doenças crônicas)</Label>
              <Textarea
                id="previous-diseases"
                value={form.intake?.previous_diseases ?? ""}
                onChange={(e) => updateIntake("previous_diseases", e.target.value || null)}
                placeholder="Ex: Cirurgia de apendicite em 2020..."
                className="rounded-xl min-h-[60px]"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medications">Medicações em uso</Label>
              <Input
                id="medications"
                value={form.intake?.medications ?? ""}
                onChange={(e) => updateIntake("medications", e.target.value || null)}
                placeholder="Ex: Losartana 50mg, Omeprazol..."
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Alergias</Label>
              <Input
                id="allergies"
                value={form.intake?.allergies ?? ""}
                onChange={(e) => updateIntake("allergies", e.target.value || null)}
                placeholder="Ex: Penicilina, dipirona..."
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="family-history">Antecedentes familiares (doenças na família)</Label>
              <Textarea
                id="family-history"
                value={form.intake?.family_history ?? ""}
                onChange={(e) => updateIntake("family_history", e.target.value || null)}
                placeholder="Ex: Diabetes na família, depressão..."
                className="rounded-xl min-h-[60px]"
                rows={2}
              />
            </div>
          </Section>

          <Section title="Hábitos de Vida">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diet">Alimentação</Label>
                <Input
                  id="diet"
                  value={form.intake?.diet ?? ""}
                  onChange={(e) => updateIntake("diet", e.target.value || null)}
                  placeholder="Ex: Regular, vegetariana..."
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="physical-activity">Atividade física</Label>
                <Input
                  id="physical-activity"
                  value={form.intake?.physical_activity ?? ""}
                  onChange={(e) => updateIntake("physical_activity", e.target.value || null)}
                  placeholder="Ex: Caminhada 3x/semana..."
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smoking">Tabagismo</Label>
                <Input
                  id="smoking"
                  value={form.intake?.smoking ?? ""}
                  onChange={(e) => updateIntake("smoking", e.target.value || null)}
                  placeholder="Ex: Não fumante, ex-fumante..."
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alcohol">Consumo de álcool</Label>
                <Input
                  id="alcohol"
                  value={form.intake?.alcohol ?? ""}
                  onChange={(e) => updateIntake("alcohol", e.target.value || null)}
                  placeholder="Ex: Social, abstêmio..."
                  className="rounded-xl"
                />
              </div>
            </div>
          </Section>

          <Section title="Exames Complementares (se houver)">
            <div className="space-y-2">
              <Label htmlFor="exams-done">Exames já realizados</Label>
              <Input
                id="exams-done"
                value={form.intake?.exams_done ?? ""}
                onChange={(e) => updateIntake("exams_done", e.target.value || null)}
                placeholder="Ex: Hemograma, TSH, glicemia..."
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exam-results">Resultados de exames</Label>
              <Textarea
                id="exam-results"
                value={form.intake?.exam_results ?? ""}
                onChange={(e) => updateIntake("exam_results", e.target.value || null)}
                placeholder="Descreva os resultados relevantes..."
                className="rounded-xl min-h-[60px]"
                rows={2}
              />
            </div>
          </Section>

          {error && <p className="text-sm text-destructive">{error}</p>}
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
