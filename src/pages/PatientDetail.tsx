import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePatient } from "@/hooks/usePatient";
import { usePatientEvolution } from "@/hooks/usePatientEvolution";
import { usePatientPatterns } from "@/hooks/usePatientPatterns";
import { useEmotionalEvolution } from "@/hooks/useEmotionalEvolution";
import { EmotionTimelineChart } from "@/components/patients/EmotionTimelineChart";
import { EmotionFrequencyCloud } from "@/components/patients/EmotionFrequencyCloud";
import { EmotionTrendIndicators } from "@/components/patients/EmotionTrendIndicators";
import { PatientAnamnesis } from "@/components/patients/PatientAnamnesis";
import { ErrorState } from "@/components/ErrorState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ArrowLeft, Mail, Phone, Calendar, FileText, Clock, Sparkles, Heart, Tag, GitBranch, AlertTriangle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

const CHART_COLORS = ["hsl(42, 52%, 53%)", "hsl(158, 40%, 50%)", "hsl(210, 60%, 55%)", "hsl(350, 70%, 60%)"];

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { patient, loading, error, refetch, saveAnamnesis } = usePatient(id);
  const { evolution, loading: evolutionLoading } = usePatientEvolution(id);
  const { patterns, loading: patternsLoading } = usePatientPatterns(id);
  const { data: emotionalData, loading: emotionalLoading } = useEmotionalEvolution(id);

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
              aria-label="Voltar para lista de pacientes"
            >
              <ArrowLeft className="h-5 w-5" aria-hidden="true" />
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

        {/* Anamnese */}
        {patient.anamnesis && (
          <PatientAnamnesis
            data={patient.anamnesis}
            onSave={saveAnamnesis}
          />
        )}

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
                  onClick={() => navigate(`/sessions/${session.id}`, { state: { sessionFromList: { id: session.id, patient: patient.full_name ?? patient.name ?? "—", date: formatDate(session.date), time: session.time ? formatTime(session.time) : "—", duration: session.duration ?? "", type: session.type ?? "", status: session.status ?? "" } } })}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate(`/sessions/${session.id}`, { state: { sessionFromList: { id: session.id, patient: patient.full_name ?? patient.name ?? "—", date: formatDate(session.date), time: session.time ? formatTime(session.time) : "—", duration: session.duration ?? "", type: session.type ?? "", status: session.status ?? "" } } }); } }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Sessão de ${formatDate(session.date)} ${session.time ? formatTime(session.time) : ""}, ${session.type ?? ""}. Pressione Enter para ver detalhes.`}
                  className="card-soft p-4 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
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

        {/* Evolução terapêutica */}
        <div className="space-y-4">
          <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Evolução terapêutica
          </h2>

          {evolutionLoading ? (
            <div className="card-soft p-8">
              <LoadingSkeleton variant="list" />
            </div>
          ) : evolution ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Temas recorrentes */}
                <div className="card-soft p-6">
                  <h3 className="font-heading text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Tag className="h-4 w-4 text-primary" />
                    Temas recorrentes
                  </h3>
                  {evolution.recurringThemes.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {evolution.recurringThemes.map((theme, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="rounded-lg bg-primary/10 text-primary border-primary/20"
                        >
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Os temas serão identificados conforme as sessões forem analisadas pela IA.
                    </p>
                  )}
                </div>

                {/* Emoções mais frequentes */}
                <div className="card-soft p-6">
                  <h3 className="font-heading text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    Emoções mais frequentes
                  </h3>
                  {evolution.frequentEmotions.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {evolution.frequentEmotions.map((emotion, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="rounded-lg bg-chart-amber/20 text-chart-amber border-chart-amber/30"
                        >
                          {emotion}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      As emoções serão mapeadas conforme as sessões forem analisadas pela IA.
                    </p>
                  )}
                </div>
              </div>

              {/* Gráfico de emoções por sessão */}
              {evolution.emotionsBySession.length > 0 && (
                <div className="card-soft p-6">
                  <h3 className="font-heading text-base font-semibold text-foreground mb-6" id="emotions-chart-heading">
                    Emoções por sessão
                  </h3>
                  {/* Tabela alternativa para leitores de tela */}
                  <table className="sr-only" aria-labelledby="emotions-chart-heading">
                    <thead>
                      <tr>
                        <th>Sessão</th>
                        <th>Quantidade de emoções</th>
                      </tr>
                    </thead>
                    <tbody>
                      {evolution.emotionsBySession.map((s, i) => (
                        <tr key={i}>
                          <td>{s.sessionDate ? new Date(s.sessionDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }) : String(s.sessionId)}</td>
                          <td>{s.emotions?.length ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div aria-hidden="true">
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={evolution.emotionsBySession.map((s) => ({
                        sessao: s.sessionDate
                          ? new Date(s.sessionDate).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                            })
                          : String(s.sessionId),
                        emocoes: s.emotions.length,
                        total: s.emotions.length,
                      }))}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="sessao"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                          color: "hsl(var(--foreground))",
                          fontSize: "12px",
                        }}
                        formatter={(value: number, _: unknown, props: { payload?: { sessao: string } }) => [
                          `${value} emoção(ões) detectada(s)`,
                          props?.payload?.sessao ?? "",
                        ]}
                      />
                      <Bar dataKey="emocoes" radius={[6, 6, 0, 0]}>
                        {evolution.emotionsBySession.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card-soft p-8 text-center">
              <p className="text-muted-foreground">
                Os dados de evolução terapêutica serão exibidos conforme as sessões forem analisadas pela IA.
              </p>
            </div>
          )}
        </div>

        {/* Evolução Emocional */}
        <div className="space-y-4">
          <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Evolução emocional do paciente
          </h2>

          {emotionalLoading ? (
            <div className="card-soft p-8">
              <LoadingSkeleton variant="list" />
            </div>
          ) : emotionalData &&
            (emotionalData.timelineData.length > 0 ||
              emotionalData.emotionFrequency.length > 0 ||
              emotionalData.trend.length > 0) ? (
            <div className="card-soft p-6 space-y-6">
              {emotionalData.timelineData.length > 0 && (
                <div>
                  <h3 className="font-heading text-base font-semibold text-foreground mb-4">
                    Linha do tempo emocional
                  </h3>
                  <EmotionTimelineChart data={emotionalData.timelineData} />
                </div>
              )}
              {emotionalData.emotionFrequency.length > 0 && (
                <div>
                  <h3 className="font-heading text-base font-semibold text-foreground mb-4">
                    Emoções mais frequentes
                  </h3>
                  <EmotionFrequencyCloud items={emotionalData.emotionFrequency} />
                </div>
              )}
              {emotionalData.trend.length > 0 && (
                <div>
                  <h3 className="font-heading text-base font-semibold text-foreground mb-4">
                    Tendências
                  </h3>
                  <EmotionTrendIndicators trends={emotionalData.trend} />
                </div>
              )}
            </div>
          ) : (
            <div className="card-soft p-8 text-center">
              <p className="text-muted-foreground">
                Os dados aparecerão após as sessões serem analisadas pela IA.
              </p>
            </div>
          )}
        </div>

        {/* Padrões Terapêuticos */}
        <div className="space-y-4">
          <h2 className="font-heading text-lg font-semibold text-foreground flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-primary" />
            Padrões Terapêuticos
          </h2>

          {patternsLoading ? (
            <div className="card-soft p-8">
              <LoadingSkeleton variant="list" />
            </div>
          ) : patterns ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Temas dominantes */}
                <Card className="card-soft border-border overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      Temas dominantes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patterns.dominantThemes.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {patterns.dominantThemes.map((theme, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="rounded-lg bg-primary/10 text-primary border-primary/20"
                          >
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Nenhum tema dominante identificado ainda.
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Emoções predominantes */}
                <Card className="card-soft border-border overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Heart className="h-4 w-4 text-primary" />
                      Emoções predominantes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {patterns.predominantEmotions.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {patterns.predominantEmotions.map((emotion, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="rounded-lg bg-chart-amber/20 text-chart-amber border-chart-amber/30"
                          >
                            {emotion}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Nenhuma emoção predominante identificada ainda.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Padrões detectados */}
              <Card className="card-soft border-border overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-primary" />
                    Padrões detectados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patterns.detectedPatterns.length > 0 ? (
                    <ul className="space-y-2">
                      {patterns.detectedPatterns.map((pattern, i) => (
                        <li key={i} className="text-sm text-foreground flex items-center gap-2">
                          <span className="text-primary">•</span>
                          {pattern}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Os padrões serão identificados conforme o acompanhamento evolua.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Alertas terapêuticos */}
              {patterns.therapeuticAlerts.length > 0 && (
                <div className="space-y-2">
                  {patterns.therapeuticAlerts.map((alert, i) => (
                    <Alert key={i} variant="destructive" className="rounded-2xl border-destructive/30">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Alerta terapêutico</AlertTitle>
                      <AlertDescription>{alert}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="card-soft p-8 text-center">
              <p className="text-muted-foreground">
                Os padrões terapêuticos serão exibidos conforme as sessões forem analisadas pela IA.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PatientDetail;
