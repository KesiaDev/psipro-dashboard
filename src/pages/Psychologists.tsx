import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageContainer } from "@/components/PageContainer";
import { useClinic } from "@/contexts/ClinicContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Plus, Search, MoreVertical, Users, Calendar, Mail, Phone } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProfessionals } from "@/hooks/useProfessionals";
import { ErrorState } from "@/components/ErrorState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

const statusMap = {
  active: { label: "Ativo", variant: "confirmed" as const },
  inactive: { label: "Inativo", variant: "secondary" as const },
  vacation: { label: "Férias", variant: "pending" as const },
};

const Psychologists = () => {
  const { selectedClinic, userRole } = useClinic();
  const [search, setSearch] = useState("");
  const { professionals, loading, error, refetch } = useProfessionals(selectedClinic?.id);

  const filtered = professionals
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.specialty.toLowerCase().includes(search.toLowerCase())
    );

  if (error) {
    const err = error as { status?: number; message?: string };
    return (
      <DashboardLayout title="Profissionais">
        <ErrorState
          title={err.status === 401 ? "Sessão expirada" : err.status === 403 ? "Acesso negado" : "Erro ao carregar profissionais"}
          message={err.message ?? "Não foi possível carregar os dados."}
          status={err.status}
          onRetry={refetch}
        />
      </DashboardLayout>
    );
  }

  if (loading && professionals.length === 0) {
    return (
      <DashboardLayout title="Profissionais">
        <LoadingSkeleton variant="list" />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Profissionais">
      <PageContainer
        title={`Profissionais — ${selectedClinic?.name ?? "—"}`}
        subtitle="Gerencie os psicólogos vinculados a esta clínica"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Clínicas", href: "/clinics" }, { label: "Profissionais" }]}
        actions={
          (userRole === "owner" || userRole === "admin") && (
            <Button variant="gold" className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Profissional
            </Button>
          )
        }
      >
        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou especialidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 input-premium"
          />
        </div>

        {/* List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((prof) => (
            <Card key={prof.id} className="bg-card border-border hover:shadow-lg transition-shadow group">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="gold-gradient text-primary-foreground font-semibold">
                      {prof.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground">{prof.name}</h3>
                        <p className="text-xs text-muted-foreground">{prof.crp}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={statusMap[prof.status]?.variant ?? "secondary"} className="text-[10px]">
                          {statusMap[prof.status]?.label ?? prof.status}
                        </Badge>
                        {userRole !== "psychologist" && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border">
                              <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
                              <DropdownMenuItem>Editar</DropdownMenuItem>
                              <DropdownMenuItem>Ver Agenda</DropdownMenuItem>
                              {userRole === "owner" && (
                                <DropdownMenuItem className="text-destructive">Remover</DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-primary mt-1">{prof.specialty}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{prof.email}</span>
                      <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{prof.phone}</span>
                    </div>
                    <div className="flex items-center gap-6 mt-3 pt-3 border-t border-border">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm font-medium text-foreground">{prof.patientsCount}</span>
                        <span className="text-xs text-muted-foreground">pacientes</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span className="text-sm font-medium text-foreground">{prof.sessionsThisMonth}</span>
                        <span className="text-xs text-muted-foreground">sessões/mês</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">Nenhum profissional encontrado</h3>
              <p className="mt-1 text-sm text-muted-foreground">Adicione profissionais a esta clínica</p>
            </div>
          )}
        </div>
      </PageContainer>
    </DashboardLayout>
  );
};

export default Psychologists;
