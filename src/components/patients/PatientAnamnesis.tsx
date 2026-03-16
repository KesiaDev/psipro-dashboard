import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ClipboardList,
  Pencil,
  Save,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import type { AnamnesisData, AnamnesisItem } from "@/types/anamnesis";

interface Props {
  data: AnamnesisData;
  onSave: (data: AnamnesisData) => Promise<boolean>;
}

export function PatientAnamnesis({ data, onSave }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<AnamnesisData>(data);
  const [saving, setSaving] = useState(false);
  const [newCustomLabel, setNewCustomLabel] = useState("");

  const standardItems = form.items.filter((i) => !i.isCustom);
  const customItems = form.items.filter((i) => i.isCustom);

  const updateItem = (key: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((i) =>
        i.key === key ? { ...i, value } : i
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const addCustomItem = () => {
    const label = newCustomLabel.trim();
    if (!label) return;
    const key = `custom_${Date.now()}`;
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { key, label, value: "", isCustom: true }],
      updatedAt: new Date().toISOString(),
    }));
    setNewCustomLabel("");
  };

  const removeCustomItem = (key: string) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.key !== key),
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const ok = await onSave({ ...form, updatedAt: new Date().toISOString() });
      if (ok) {
        toast.success("Anamnese salva com sucesso");
        setEditing(false);
      } else {
        toast.error("Erro ao salvar anamnese");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm(data);
    setNewCustomLabel("");
    setEditing(false);
  };

  const displayItems = [...standardItems, ...customItems];

  return (
    <Card className="card-soft border-border overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-5 w-5 text-primary" />
            Anamnese
          </CardTitle>
          {!editing ? (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-2"
              onClick={() => setEditing(true)}
              aria-label="Editar anamnese"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl gap-2"
                onClick={handleCancel}
                disabled={saving}
              >
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              <Button
                variant="gold"
                size="sm"
                className="rounded-xl gap-2"
                onClick={handleSave}
                disabled={saving}
                aria-label="Salvar anamnese"
              >
                <Save className="h-4 w-4" />
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Dados clínicos iniciais e acompanhamento personalizado. Use &quot;Outro&quot; para adicionar seus próprios campos.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {editing ? (
          <div className="space-y-4">
            {displayItems.map((item) => (
              <div key={item.key} className="space-y-2">
                {item.isCustom ? (
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 space-y-1">
                      <Label className="text-sm text-muted-foreground">{item.label}</Label>
                      <Textarea
                        value={item.value}
                        onChange={(e) => updateItem(item.key, e.target.value)}
                        placeholder={`${item.label}...`}
                        className="rounded-xl min-h-[80px] resize-y"
                        rows={3}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive mt-6"
                      onClick={() => removeCustomItem(item.key)}
                      aria-label={`Remover ${item.label}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label className="text-sm text-muted-foreground">{item.label}</Label>
                    <Textarea
                      value={item.value}
                      onChange={(e) => updateItem(item.key, e.target.value)}
                      placeholder={`${item.label}...`}
                      className="rounded-xl min-h-[80px] resize-y"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Adicionar campo personalizado */}
            <div className="pt-4 border-t border-border space-y-2">
              <Label className="text-sm text-muted-foreground">
                Adicionar campo personalizado
              </Label>
              <div className="flex gap-2">
                <Input
                  value={newCustomLabel}
                  onChange={(e) => setNewCustomLabel(e.target.value)}
                  placeholder="Ex: Rede de apoio, Eventos estressores"
                  className="rounded-xl"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomItem())}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-2 shrink-0"
                  onClick={addCustomItem}
                  disabled={!newCustomLabel.trim()}
                >
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {displayItems.map((item) => (
              <div key={item.key} className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                <p className="text-sm text-foreground whitespace-pre-wrap min-h-[1.5rem]">
                  {item.value || (
                    <span className="text-muted-foreground italic">Não preenchido</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
