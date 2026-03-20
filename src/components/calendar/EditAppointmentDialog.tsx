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
import { CalendarAppointment } from "@/hooks/useCalendarAppointments";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: CalendarAppointment | null;
  onUpdate: (apt: CalendarAppointment, scheduled_at: string) => Promise<boolean>;
  onCancel: (apt: CalendarAppointment) => Promise<boolean>;
}

export function EditAppointmentDialog({ open, onOpenChange, appointment, onUpdate, onCancel }: Props) {
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("09:00");
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (appointment?.date && open) {
      const d = new Date(appointment.date);
      setDateStr(d.toISOString().slice(0, 10));
      setTimeStr(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
      setError(null);
    }
  }, [appointment, open]);

  const handleSave = async () => {
    if (!appointment) return;
    if (!dateStr || !timeStr) {
      setError("Data e hora são obrigatórios.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const ok = await onUpdate(appointment, new Date(`${dateStr}T${timeStr}`).toISOString());
      if (ok) onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!appointment) return;
    setCancelling(true);
    try {
      const ok = await onCancel(appointment);
      if (ok) onOpenChange(false);
    } finally {
      setCancelling(false);
    }
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar agendamento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="font-medium text-foreground">{appointment.patient}</p>
            <p className="text-sm text-muted-foreground">{appointment.type || "Consulta"}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 min-w-0">
              <Label htmlFor="edit-apt-date">Nova data</Label>
              <Input
                id="edit-apt-date"
                type="date"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="rounded-xl w-full"
              />
            </div>
            <div className="space-y-2 min-w-0">
              <Label htmlFor="edit-apt-time">Nova hora</Label>
              <Input
                id="edit-apt-time"
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                className="rounded-xl w-full"
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 pt-4">
          <Button
            variant="destructive"
            className="rounded-xl w-full sm:w-auto"
            onClick={handleCancel}
            disabled={saving || cancelling}
          >
            {cancelling ? "Cancelando..." : "Cancelar agendamento"}
          </Button>
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <Button
              variant="gold"
              className="rounded-xl"
              onClick={handleSave}
              disabled={saving || cancelling || !dateStr || !timeStr}
            >
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
