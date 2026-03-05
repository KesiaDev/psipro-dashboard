import { useParams, useNavigate } from "react-router-dom";
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
} from "lucide-react";

const SessionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, loading, error, refetch } = useSessionDetail(id);

  if (error) {
    const err = error as { status?: number; message?: string };
    return (
      <DashboardLayout title="Sessão">
        <ErrorState
          title={
            err.status === 404
              ? "Sessão não encontrada"
              : err.status === 401
                ? "Sessão expirada"
                : err.status === 403
                  ? "Acesso negado"
                  : "Erro ao carregar sessão"
          }
          message={err.message ?? "Não foi possível carregar os dados."}
          status={err.status}
          onRetry={refetch}
        />
      </DashboardLayout>
    );
  }

  if (loading || !session) {
    return (
      <DashboardLayout title="Sessão">
        <LoadingSkeleton variant="list" />
      </DashboardLayout>
    );
  }

  const ai = session.aiAnalysis;
  const hasAIAnalysis = ai && (ai.summary || (ai.themes?.length ?? 0) > 0 || (ai.emotions?.length ?? 0) > 0);

  return (
    <DashboardLayout title={`Sessão · ${session.patient}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl shrink-0"
              onClick={() => navigate("/sessions")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground">
                Sessão · {session.patient}
              </h1>
              <p className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" /> {session.date}
                </span>
                {session.time && session.time !== "—" && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {session.time}
                    {session.duration && ` · ${session.duration}`}
                  </span>
                )}
              </p>
            </div>
          </div>
          {session.patientId && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => navigate(`/patients/${session.patientId}`)}
            >
              <User className="h-4 w-4 mr-2" />
              Ver paciente
            </Button>
          )}
        </div>

        {/* Análise da IA */}
        <div className="space-y-4">
          <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Análise da IA
          </h2>

          {!hasAIAnalysis ? (
            <div className="card-soft p-8 text-center">
              <p className="text-muted-foreground">
                Nenhuma análise da IA disponível para esta sessão.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SessionDetail;
