import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePatient } from "@/hooks/usePatient";
import { ErrorState } from "@/components/ErrorState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ArrowLeft, Mail, Phone, Calendar, FileText, Clock } from "lucide-react";

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-accent text-accent-foreground" },
  inactive: { label: "Inativo", className: "bg-muted text-muted-foreground" },
  new: { label: "Novo", className: "bg-primary/20 text-primary" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { patient, loading, error, refetch } = usePatient(id);

  if (error) {
    const err = error as { status?: number; message?: string };
    return (
      <DashboardLayout title="Paciente">
        <ErrorState
          title={
            err.status === 404
              ? "Paciente não encontrado"
              : err.status === 401
                ? "Sessão expirada"
                : err.status === 403
                  ? "Acesso negado"
                  : "Erro ao carregar paciente"
          }
          message={err.message ?? "Não foi possível carregar os dados."}
          status={err.status}
          onRetry={refetch}
        />
      </DashboardLayout>
    );
  }

  if (loading || !patient) {
    return (
      <DashboardLayout title="Paciente">
        <LoadingSkeleton variant="list" />
      </DashboardLayout>
    );
  }

  const name = patient.full_name ?? patient.name ?? "—";
  const sessionsList = patient.sessionsList ?? [];

  return (
    <DashboardLayout title={name}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl shrink-0"
              onClick={() => navigate("/patients")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">{name}</h1>
              <p className="text-sm text-muted-foreground">
                {patient.age ?? "—"} anos · {patient.sessions ?? sessionsList.length} sessões
              </p>
            </div>
          </div>
        </div>

        {/* Patient info card */}
        <div className="card-soft p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarFallback className="gold-gradient text-primary-foreground text-xl font-semibold">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> E-mail
                </p>
                <p className="text-sm font-medium text-foreground">{patient.email ?? "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> Telefone
                </p>
                <p className="text-sm font-medium text-foreground">{patient.phone ?? "—"}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> Data de nascimento
                </p>
                <p className="text-sm font-medium text-foreground">
                  {patient.date_of_birth ? formatDate(patient.date_of_birth) : "—"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">CPF</p>
                <p className="text-sm font-medium text-foreground">{patient.cpf ?? "—"}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Badge
                variant="secondary"
                className={`rounded-lg ${statusConfig[patient.status]?.className ?? statusConfig.active.className}`}
              >
                {statusConfig[patient.status]?.label ?? patient.status}
              </Badge>
            </div>
          </div>

          {patient.notes && (
            <div className="space-y-1 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> Observações
              </p>
              <p className="text-sm text-foreground whitespace-pre-wrap">{patient.notes}</p>
            </div>
          )}
        </div>

        {/* Sessions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-foreground">Sessões</h2>
            <Button variant="outline" size="sm" onClick={() => navigate(`/sessions?patientId=${patient.id}`)}>
              Ver todas
            </Button>
          </div>

          {sessionsList.length === 0 ? (
            <div className="card-soft p-8 text-center">
              <p className="text-muted-foreground">Nenhuma sessão registrada.</p>
              <Button variant="link" className="mt-2" onClick={() => navigate("/sessions")}>
                Ir para Sessões
              </Button>
            </div>
          ) : (
            <div className="grid gap-2">
              {sessionsList.map((session) => (
                <div
                  key={String(session.id)}
                  className="card-soft p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">{formatDate(session.date)}</span>
                    {session.time && (
                      <>
                        <Clock className="h-3.5 w-3.5" />
                        <span className="text-sm">{formatTime(session.time)}</span>
                      </>
                    )}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    {session.type && (
                      <span className="text-xs text-muted-foreground">{session.type}</span>
                    )}
                    {session.duration && (
                      <span className="text-xs text-muted-foreground">· {session.duration}</span>
                    )}
                  </div>
                  {session.status && (
                    <Badge variant="secondary" className="rounded-lg text-[10px]">
                      {session.status}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDetail;
