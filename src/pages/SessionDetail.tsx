import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSessionDetail } from "@/hooks/useSessionDetail";
import { ErrorState } from "@/components/ErrorState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  Sparkles,
  Heart,
  ListTodo,
  AlertTriangle,
  User,
  Volume2,
  Pencil,
} from "lucide-react";
import { useClinic } from "@/contexts/ClinicContext";
import { usePatients } from "@/hooks/usePatients";
import { useProfessionals } from "@/hooks/useProfessionals";
import { useSessionsData } from "@/hooks/useSessionsData";
import { EditSessionDialog } from "@/components/sessions/EditSessionDialog";
import { speakText, isSpeechSupported } from "@/lib/speech";

const SessionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedClinic } = useClinic();
  const { patients } = usePatients();
  const { professionals } = useProfessionals(selectedClinic?.id);
  const { sessions, updateSession } = useSessionsData();
  const { session, loading, error, refetch } = useSessionDetail(id);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const sessionFromList = (location.state as { sessionFromList?: { id: string | number; patient: string; date: string; time: string; duration: string; type: string; status: string; patient_id?: string } })?.sessionFromList;
  const sessionFromSessionsList = id && !session && (error as { status?: number })?.status === 404
    ? sessions.find((s) => String(s.id) === String(id))
    : null;
  const fallbackSession = sessionFromList ?? (sessionFromSessionsList
    ? { id: sessionFromSessionsList.id, patient: sessionFromSessionsList.patient, date: sessionFromSessionsList.date, time: sessionFromSessionsList.time, duration: sessionFromSessionsList.duration, type: sessionFromSessionsList.type, status: sessionFromSessionsList.status, patientId: sessionFromSessionsList.patient_id }
    : null);

  const displaySession = session ?? fallbackSession;
  const sessionForEdit = session ?? (sessionFromSessionsList
    ? {
        id: sessionFromSessionsList.id,
        patient: sessionFromSessionsList.patient,
        patient_id: sessionFromSessionsList.patient_id,
        date: sessionFromSessionsList.date,
        time: sessionFromSessionsList.time ?? "",
        duration: sessionFromSessionsList.duration ?? "",
        duration_minutes: sessionFromSessionsList.duration_minutes ?? 50,
        type: sessionFromSessionsList.type ?? "Consulta",
        status: sessionFromSessionsList.status,
        scheduled_at: sessionFromSessionsList.scheduled_at,
        professional_id: sessionFromSessionsList.professional_id,
      }
    : null);

  if (error && !displaySession) {
    const err = error as { status?: number; message?: string };
    const is404 = err.status === 404;
    const friendlyMessage = is404
      ? "Esta sessão pode ter sido removida ou não está mais disponível."
      : (err.message ?? "Não foi possível carregar os dados.");
    return (
      <DashboardLayout title="Sessão">
        <ErrorState
          title={
            is404
              ? "Sessão não encontrada"
              : err.status === 401
                ? "Sessão expirada"
                : err.status === 403
                  ? "Acesso negado"
                  : "Erro ao carregar sessão"
          }
          message={friendlyMessage}
          status={err.status}
          onRetry={is404 ? undefined : refetch}
        />
        {is404 && (
          <div className="flex justify-center mt-4">
            <Button variant="gold" className="rounded-xl" onClick={() => navigate("/sessions")}>
              Voltar para sessões
            </Button>
          </div>
        )}
      </DashboardLayout>
    );
  }

  if (loading && !displaySession) {
    return (
      <DashboardLayout title="Sessão">
        <LoadingSkeleton variant="list" />
      </DashboardLayout>
    );
  }

  if (!displaySession) return null;

  const ai = displaySession.aiAnalysis;
  const hasAIAnalysis = ai && (ai.summary || (ai.themes?.length ?? 0) > 0 || (ai.emotions?.length ?? 0) > 0);

  const getTextToSpeak = (): string => {
    if (!ai) return "";
    const parts: string[] = [];
    if (ai.summary) {
      parts.push(`Resumo da sessão. ${ai.summary}`);
    }
    if (ai.themes?.length) {
      parts.push(`Temas principais: ${ai.themes.join(". ")}`);
    }
    if (ai.emotions?.length) {
      parts.push(`Emoções predominantes: ${ai.emotions.join(", ")}`);
    }
    return parts.join(" ") || "";
  };

  const textToSpeak = getTextToSpeak();
  const canSpeak = hasAIAnalysis && textToSpeak && isSpeechSupported();

  return (
    <DashboardLayout title={`Sessão · ${displaySession.patient}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl shrink-0"
              onClick={() => navigate("/sessions")}
              aria-label="Voltar para lista de sessões"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Sessão · {displaySession.patient}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> {displaySession.date}
                </span>
                {displaySession.time && displaySession.time !== "—" && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {displaySession.time}
                    {displaySession.duration && ` · ${displaySession.duration}`}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {sessionForEdit && (sessionForEdit.patient_id ?? (sessionForEdit as { patientId?: string }).patientId) && (
              <Button
                variant="gold"
                size="sm"
                className="rounded-xl gap-2"
                onClick={() => setShowEditDialog(true)}
              >
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
            )}
            {"patientId" in displaySession && displaySession.patientId && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => navigate(`/patients/${displaySession.patientId}`)}
              >
                <User className="h-4 w-4 mr-2" />
                Ver paciente
              </Button>
            )}
          </div>
        </div>

        {sessionForEdit && (
          <EditSessionDialog
            open={showEditDialog}
            onOpenChange={setShowEditDialog}
            session={{
              id: sessionForEdit.id,
              patient: sessionForEdit.patient,
              patient_id: sessionForEdit.patient_id ?? ("patientId" in sessionForEdit ? sessionForEdit.patientId : undefined),
              initials: sessionForEdit.patient?.slice(0, 2).toUpperCase() ?? "",
              date: sessionForEdit.date,
              time: sessionForEdit.time ?? "",
              duration: sessionForEdit.duration ?? "",
              duration_minutes: sessionForEdit.duration_minutes ?? 50,
              type: sessionForEdit.type ?? "Consulta",
              status: (sessionForEdit.status as "completed" | "scheduled" | "cancelled" | "in-progress") ?? "scheduled",
              notes: typeof (sessionForEdit as { notes?: string }).notes === "string" ? (sessionForEdit as { notes?: string }).notes : false,
              scheduled_at: "scheduled_at" in sessionForEdit ? sessionForEdit.scheduled_at : ("start_at" in sessionForEdit ? sessionForEdit.start_at : undefined),
              professional_id: sessionForEdit.professional_id,
            }}
            patients={patients}
            professionals={professionals}
            onSave={async (id, input) => {
              const ok = await updateSession(id, input);
              if (ok) refetch();
              return ok;
            }}
          />
        )}

        {/* Observações - Notas da sessão (do profissional) */}
        {displaySession.notes && (
          <section className="space-y-4" aria-labelledby="observacoes-heading">
            <h2 id="observacoes-heading" className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" aria-hidden="true" />
              Observações
            </h2>
            <div className="card-soft p-4">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{displaySession.notes}</p>
            </div>
          </section>
        )}

        {/* Análise da IA */}
        <section className="space-y-4" aria-labelledby="ai-analysis-heading">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 id="ai-analysis-heading" className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
              Análise da IA
            </h2>
            {canSpeak && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl gap-2 shrink-0"
                onClick={() => speakText(textToSpeak)}
                aria-label="Ouvir resumo da sessão em voz alta"
              >
                <Volume2 className="h-4 w-4" aria-hidden="true" />
                Ouvir resumo da sessão
              </Button>
            )}
          </div>

          {!hasAIAnalysis ? (
            <div className="card-soft p-8 text-center">
              <p className="text-muted-foreground">
                Nenhuma análise da IA disponível para esta sessão.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2" aria-live="polite" aria-label="Análise da sessão gerada pela inteligência artificial">
              {/* Resumo clínico */}
              {ai?.summary && (
                <Card className="card-soft border-border overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      Resumo da sessão
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground leading-relaxed">{ai.summary}</p>
                  </CardContent>
                </Card>
              )}

              {/* Temas principais */}
              {ai?.themes && ai.themes.length > 0 && (
                <Card className="card-soft border-border overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Temas principais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {ai.themes.map((theme, i) => (
                        <li key={i} className="text-sm text-foreground flex items-center gap-2">
                          <span className="text-primary">•</span>
                          {theme}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Emoções predominantes */}
              {ai?.emotions && ai.emotions.length > 0 && (
                <Card className="card-soft border-border overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      Emoções predominantes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {ai.emotions.map((emotion, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="rounded-lg bg-primary/10 text-primary border-primary/20"
                        >
                          {emotion}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Possíveis tarefas */}
              {ai?.actionItems && ai.actionItems.length > 0 && (
                <Card className="card-soft border-border overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ListTodo className="h-4 w-4 text-primary" />
                      Possíveis tarefas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {ai.actionItems.map((item, i) => (
                        <li key={i} className="text-sm text-foreground flex items-center gap-2">
                          <span className="text-primary">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Alertas - full width when present */}
              {ai?.riskFlags && ai.riskFlags.length > 0 && (
                <Card className="card-soft border-destructive/30 bg-destructive/5 md:col-span-2 overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      Alertas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {ai.riskFlags.map((flag, i) => (
                        <li
                          key={i}
                          className="text-sm text-foreground flex items-center gap-2"
                        >
                          <span className="text-destructive">•</span>
                          {flag}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default SessionDetail;
