import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Crown, Shield, User, Building2 } from "lucide-react";
import { useClinic, type UserRole } from "@/contexts/ClinicContext";

const roleLabels: Record<UserRole, { label: string; icon: React.ElementType }> = {
  owner: { label: "Proprietário", icon: Crown },
  admin: { label: "Administrador", icon: Shield },
  psychologist: { label: "Psicólogo", icon: User },
};

export function WorkspaceSelectionModal() {
  const { clinics, selectedClinic, setSelectedClinicId, userRole, setUserRole, confirmWorkspaceSelection } = useClinic();

  const handleConfirm = () => {
    if (selectedClinic?.id) {
      confirmWorkspaceSelection();
    }
  };

  const canConfirm = selectedClinic?.id;

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Como deseja acessar?
          </DialogTitle>
          <DialogDescription>
            Escolha a clínica e a função com a qual deseja trabalhar. Essa seleção pode ser alterada a qualquer momento no menu superior.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground tracking-wider">Sua clínica</Label>
            <div className="grid gap-2">
              {clinics.map((clinic) => (
                <button
                  key={clinic.id}
                  type="button"
                  onClick={() => setSelectedClinicId(clinic.id)}
                  className={`flex flex-col items-start gap-0.5 p-4 rounded-xl border-2 text-left transition-colors ${
                    selectedClinic?.id === clinic.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50 bg-card"
                  }`}
                >
                  <span className="font-medium text-foreground">{clinic.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {clinic.professionals} profissionais · {clinic.patients} pacientes
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase text-muted-foreground tracking-wider">Visualizar como</Label>
            <div className="grid grid-cols-3 gap-2">
              {(["owner", "admin", "psychologist"] as UserRole[]).map((role) => {
                const { label, icon: Icon } = roleLabels[role];
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setUserRole(role)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                      userRole === role ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 bg-card"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${userRole === role ? "text-primary" : "text-muted-foreground"}`} />
                    <span className={`text-xs font-medium ${userRole === role ? "text-primary" : "text-foreground"}`}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {userRole === "owner" && "Gerencie a clínica, profissionais e configurações."}
              {userRole === "admin" && "Acesse gestão e relatórios da clínica."}
              {userRole === "psychologist" && "Acesse sua agenda e pacientes."}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="gold" className="rounded-xl" onClick={handleConfirm} disabled={!canConfirm}>
            Entrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
