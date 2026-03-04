import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageContainer } from "@/components/PageContainer";
import { useClinic } from "@/contexts/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Users, MapPin, Phone, Mail, MoreVertical, TrendingUp, Pencil, Users as UsersIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ClinicFormDialog } from "@/components/clinics/ClinicFormDialog";
import { ErrorState } from "@/components/ErrorState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import type { Clinic } from "@/hooks/useClinics";

const Clinics = () => {
  const navigate = useNavigate();
  const { clinics, userRole, loading, error, refetch, createClinic, updateClinic, updateClinicStatus } = useClinic();
  const [showClinicDialog, setShowClinicDialog] = useState(false);
  const [clinicToEdit, setClinicToEdit] = useState<Clinic | null>(null);
  const [clinicToDeactivate, setClinicToDeactivate] = useState<Clinic | null>(null);

  if (error) {
    const err = error as { status?: number; message?: string };
    return (
      <DashboardLayout title="Clínicas">
        <ErrorState
          title={err.status === 401 ? "Sessão expirada" : err.status === 403 ? "Acesso negado" : "Erro ao carregar clínicas"}
          message={err.message ?? "Não foi possível carregar os dados."}
          status={err.status}
          onRetry={refetch}
        />
      </DashboardLayout>
    );
  }

  if (loading && clinics.length === 0) {
    return (
      <DashboardLayout title="Clínicas">
        <LoadingSkeleton variant="page" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Clínicas">
      <PageContainer
        title="Gestão de Clínicas"
        subtitle="Gerencie todas as suas unidades clínicas"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Clínicas" }]}
        actions={
          userRole === "owner" && (
            <Button variant="gold" className="gap-2" onClick={() => { setClinicToEdit(null); setShowClinicDialog(true); }}>
              <Plus className="h-4 w-4" />
              Nova Clínica
            </Button>
          )
        }
      >
        {/* Summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl gold-gradient">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{clinics.length}</p>
                <p className="text-xs text-muted-foreground">Unidades Ativas</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                <Users className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {clinics.reduce((s, c) => s + c.professionals, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Profissionais</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent">
                <TrendingUp className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {clinics.reduce((s, c) => s + c.patients, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Pacientes Total</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <ClinicFormDialog
          open={showClinicDialog}
          onOpenChange={(o) => { setShowClinicDialog(o); if (!o) setClinicToEdit(null); }}
          clinic={clinicToEdit}
          onCreate={createClinic}
          onUpdate={updateClinic}
        />

        <AlertDialog open={!!clinicToDeactivate} onOpenChange={(o) => !o && setClinicToDeactivate(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Desativar clínica</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja desativar <strong>{clinicToDeactivate?.name}</strong>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async () => {
                  if (clinicToDeactivate && (await updateClinicStatus(clinicToDeactivate.id, "inactive"))) {
                    setClinicToDeactivate(null);
                  }
                }}
              >
                Desativar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Clinic cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          {clinics.map((clinic) => (
            <Card key={clinic.id} className="bg-card border-border hover:shadow-lg transition-shadow group">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl gold-gradient">
                    <Building2 className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">{clinic.name}</CardTitle>
                    <Badge variant={clinic.status === "active" ? "confirmed" : "secondary"} className="mt-1 text-[10px]">
                      {clinic.status === "active" ? "Ativa" : "Inativa"}
                    </Badge>
                  </div>
                </div>
                {(userRole === "owner" || userRole === "admin") && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuItem onClick={() => { setClinicToEdit(clinic); setShowClinicDialog(true); }}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { navigate("/psychologists"); }}>
                        <UsersIcon className="h-4 w-4 mr-2" />
                        Ver profissionais
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/financials")}>
                        Financeiro
                      </DropdownMenuItem>
                      {userRole === "owner" && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setClinicToDeactivate(clinic)}
                        >
                          Desativar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{clinic.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 shrink-0" />
                    <span>{clinic.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5 shrink-0" />
                    <span>{clinic.email}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{clinic.professionals}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Profissionais</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground">{clinic.patients}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Pacientes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">{clinic.plan}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Plano</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PageContainer>
    </DashboardLayout>
  );
};

export default Clinics;
