import { useClinic, UserRole } from "@/contexts/ClinicContext";
import { Building2, ChevronDown, Shield, Crown, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const roleLabels: Record<UserRole, { label: string; icon: React.ElementType }> = {
  owner: { label: "Proprietário", icon: Crown },
  admin: { label: "Administrador", icon: Shield },
  psychologist: { label: "Psicólogo", icon: User },
};

export function ClinicSelector() {
  const { clinics, selectedClinic, setSelectedClinicId, userRole, setUserRole } = useClinic();
  const RoleIcon = roleLabels[userRole].icon;

  return (
    <div className="flex items-center gap-2">
      {/* Role indicator */}
      <Badge variant="outline" className="hidden sm:flex gap-1.5 border-primary/30 text-primary text-xs">
        <RoleIcon className="h-3 w-3" />
        {roleLabels[userRole].label}
      </Badge>

      {/* Clinic dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="gap-2 rounded-xl border border-border bg-card/50 px-3 hover:bg-accent">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline text-sm font-medium text-foreground max-w-[160px] truncate">
              {selectedClinic.name}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-card border-border">
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
            Suas Clínicas
          </DropdownMenuLabel>
          {clinics.map((clinic) => (
            <DropdownMenuItem
              key={clinic.id}
              onClick={() => setSelectedClinicId(clinic.id)}
              className="flex flex-col items-start gap-0.5 cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full">
                <span className="font-medium text-foreground">{clinic.name}</span>
                {clinic.id === selectedClinic.id && (
                  <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {clinic.professionals} profissionais · {clinic.patients} pacientes
              </span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground uppercase tracking-wider">
            Visualizar como
          </DropdownMenuLabel>
          {(["owner", "admin", "psychologist"] as UserRole[]).map((role) => {
            const { label, icon: Icon } = roleLabels[role];
            return (
              <DropdownMenuItem
                key={role}
                onClick={() => setUserRole(role)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Icon className="h-3.5 w-3.5 text-primary" />
                <span className={userRole === role ? "font-semibold text-primary" : "text-foreground"}>
                  {label}
                </span>
                {userRole === role && <span className="ml-auto h-2 w-2 rounded-full bg-primary" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
