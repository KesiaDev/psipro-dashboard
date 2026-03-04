import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";
import { useClinic } from "@/contexts/ClinicContext";
import { useState } from "react";

export function CreateFirstClinicModal() {
  const { createClinic, refetch } = useClinic();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Nome do consultório é obrigatório.");
      return;
    }
    if (!email.trim()) {
      setError("E-mail é obrigatório.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const created = await createClinic({ name: name.trim(), address: address.trim() || undefined, phone: phone.trim() || undefined, email: email.trim() });
      if (created) {
        await refetch();
      } else {
        setError("Não foi possível criar o consultório.");
      }
    } catch {
      setError("Erro ao criar consultório.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Crie seu consultório
          </DialogTitle>
          <DialogDescription>
            Você ainda não tem um consultório. Crie o seu para começar a gerenciar pacientes, profissionais e sessões.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome do consultório *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Consultório Dra. Maria"
              className="rounded-xl"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Endereço</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Endereço completo"
              className="rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail *</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contato@consultorio.com"
                className="rounded-xl"
              />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" variant="gold" className="w-full rounded-xl" disabled={saving}>
            {saving ? "Criando..." : "Criar meu consultório"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
