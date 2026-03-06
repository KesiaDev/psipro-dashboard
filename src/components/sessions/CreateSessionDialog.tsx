import { useState } from "react";
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
import type { CreateSessionInput } from "@/hooks/useSessionsData";
import type { Patient } from "@/hooks/usePatients";
import type { Professional } from "@/hooks/useProfessionals";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patients: Patient[];
  professionals: Professional[];
  onSave: (input: CreateSessionInput) => Promise<boolean>;
}

export function CreateSessionDialog({ open, onOpenChange, patients, professionals, onSave }: Props) {
  const [patientId, setPatientId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("09:00");
  const [duration, setDuration] = useState(50);
  const [type, setType] = useState("Consulta");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setPatientId("");
    setProfessionalId("");
    const d = new Date();
    d.setHours(9, 0, 0, 0);
    setDateStr(d.toISOString().slice(0, 10));
    setTimeStr(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    setDuration(50);
    setType("Consulta");
    setNotes("");
    setError(null);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) reset();
    else setError(null);
    onOpenChange(newOpen);
  };

  const handleSave = async () => {
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
      const ok = await onSave({
        patient_id: patientId,
        professional_id: professionalId && professionalId !== "_empty" ? professionalId : undefined,
        scheduled_at: new Date(`${dateStr}T${timeStr}`).toISOString(),
        duration_minutes: duration,
        type,
        notes: notes.trim() || undefined,
      });
      if (ok) handleOpenChange(false);
    } catch {
      setError("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Sessão</DialogTitle>
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
              <Label htmlFor="session-date">Data *</Label>
              <Input
                id="session-date"
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="rounded-xl"
                aria-label="Data da sessão"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-time">Hora *</Label>
              <Input
                id="session-time"
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="rounded-xl"
                aria-label="Hora da sessão (ex: 14:30)"
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
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas da sessão"
              className="rounded-xl"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" className="rounded-xl" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="gold" className="rounded-xl" onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
