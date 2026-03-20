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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CreateSessionInput, SessionClinicalData } from "@/hooks/useSessionsData";
import type { SessionItem } from "@/hooks/useSessionsData";
import type { Patient } from "@/hooks/usePatients";
import type { Professional } from "@/hooks/useProfessionals";

type SessionForEdit = SessionItem & { clinical?: SessionClinicalData };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: SessionForEdit | null;
  patients: Patient[];
  professionals: Professional[];
  onSave: (id: string | number, input: CreateSessionInput) => Promise<boolean>;
}

export function EditSessionDialog({ open, onOpenChange, session, patients, professionals, onSave }: Props) {
  const [patientId, setPatientId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("09:00");
  const [duration, setDuration] = useState(50);
  const [type, setType] = useState("Consulta");
  const [notes, setNotes] = useState("");
  const [emotionalState, setEmotionalState] = useState<number | "">("");
  const [evolutionNotes, setEvolutionNotes] = useState("");
  const [interventions, setInterventions] = useState("");
  const [homework, setHomework] = useState("");
  const [riskStatus, setRiskStatus] = useState<SessionClinicalData["risk_status"] | "">("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session && open) {
      setPatientId(session.patient_id ?? "");
      setProfessionalId(session.professional_id ?? "_empty");
      setDuration(session.duration_minutes ?? 50);
      setType(session.type || "Consulta");
      setNotes(typeof session.notes === "string" ? session.notes : "");
      const c = (session as SessionForEdit).clinical;
      setEmotionalState(c?.emotional_state ?? "");
      setEvolutionNotes(c?.evolution_notes ?? "");
      setInterventions(c?.interventions ?? "");
      setHomework(c?.homework ?? "");
      setRiskStatus(c?.risk_status ?? "");
      if (session.scheduled_at) {
        const d = new Date(session.scheduled_at);
        setDateStr(d.toISOString().slice(0, 10));
        setTimeStr(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
      } else {
        setDateStr("");
        setTimeStr("09:00");
      }
      setError(null);
    }
  }, [session, open]);

  const handleSave = async () => {
    if (!session) return;
    if (!patientId?.trim()) {
      setError("Selecione o paciente.");
      return;
    }
    if (!dateStr || !timeStr) {
      setError("Data e hora são obrigatórios.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const ok = await onSave(session.id, {
        patient_id: patientId,
        professional_id: professionalId && professionalId !== "_empty" ? professionalId : undefined,
        scheduled_at: new Date(`${dateStr}T${timeStr}`).toISOString(),
        duration_minutes: duration,
        type,
        notes: notes.trim() || undefined,
        clinical: {
          emotional_state: emotionalState !== "" ? Number(emotionalState) : undefined,
          evolution_notes: evolutionNotes.trim() || undefined,
          interventions: interventions.trim() || undefined,
          homework: homework.trim() || undefined,
          risk_status: riskStatus || undefined,
        },
      });
      if (ok) onOpenChange(false);
    } catch {
      setError("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Sessão</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Paciente *</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Selecione o paciente" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.full_name ?? p.name ?? "—"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Profissional</Label>
            <Select value={professionalId} onValueChange={setProfessionalId}>
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Selecione (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_empty">Nenhum</SelectItem>
                {professionals.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-session-date">Data *</Label>
              <Input
                id="edit-session-date"
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-session-time">Hora *</Label>
              <Input
                id="edit-session-time"
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="rounded-xl"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Duração (minutos)</Label>
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value) || 50)}
              min={15}
              max={180}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Input
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="Consulta, Avaliação..."
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas gerais da sessão"
              className="rounded-xl min-h-[80px]"
              rows={3}
            />
          </div>

          <div className="border-t border-border pt-4 space-y-4">
            <p className="text-sm font-medium text-foreground">Prontuário clínico</p>
            <div className="space-y-2">
              <Label>Estado emocional / Humor (1–10)</Label>
              <Select
                value={emotionalState === "" ? "_empty" : String(emotionalState)}
                onValueChange={(v) => setEmotionalState(v === "_empty" ? "" : Number(v))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_empty">Não informado</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Evolução do paciente</Label>
              <Textarea
                value={evolutionNotes}
                onChange={(e) => setEvolutionNotes(e.target.value)}
                placeholder="Progresso terapêutico, mudanças observadas..."
                className="rounded-xl min-h-[60px]"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Técnicas / Intervenções utilizadas</Label>
              <Textarea
                value={interventions}
                onChange={(e) => setInterventions(e.target.value)}
                placeholder="Ex: TCC, reestruturação cognitiva, relaxamento..."
                className="rounded-xl min-h-[60px]"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Tarefas de casa / Combinados</Label>
              <Textarea
                value={homework}
                onChange={(e) => setHomework(e.target.value)}
                placeholder="Tarefas e combinados para a próxima sessão"
                className="rounded-xl min-h-[60px]"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Status de risco</Label>
              <Select
                value={riskStatus || "_empty"}
                onValueChange={(v) => setRiskStatus(v === "_empty" ? "" : (v as SessionClinicalData["risk_status"]))}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_empty">Não informado</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Baixo</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="gold" className="rounded-xl" onClick={handleSave} disabled={saving || !patientId || !dateStr || !timeStr}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
