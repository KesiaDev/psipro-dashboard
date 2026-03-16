import { DashboardLayout } from "@/components/DashboardLayout";
import { PageContainer } from "@/components/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Server,
  Database,
  Smartphone,
  Globe,
  RefreshCw,
  Activity,
  Timer,
  Tag,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useSystemHealth } from "@/hooks/useSystemHealth";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";

const CARD_CONFIG = [
  { key: "backend" as const, title: "Backend API", icon: Server },
  { key: "database" as const, title: "Database", icon: Database },
  { key: "web" as const, title: "Web", icon: Globe },
  { key: "mobileSync" as const, title: "Mobile Sync", icon: Smartphone },
] as const;

const STATUS_LABELS = {
  operational: "Operacional",
  degraded: "Degradado",
  down: "Indisponível",
} as const;

const STATUS_BADGE_STYLES = {
  operational: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  degraded: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30",
  down: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
} as const;

const SystemHealth = () => {
  const {
    backend,
    database,
    web,
    mobileSync,
    overallStatus,
    uptime,
    version,
    latencyHistory,
    loading,
    error,
    refetch,
  } = useSystemHealth();

  const chartData = latencyHistory.map((r) => ({
    ...r,
    name: `#${r.index}`,
  }));

  const statusMap = { backend, database, web, mobileSync };

  if (error && !loading) {
    return (
      <DashboardLayout title="System Health">
        <ErrorState title="Erro ao carregar" message={error} onRetry={refetch} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="System Health">
      <PageContainer
        title="System Health"
        subtitle="Status do backend e sincronização"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "System Health" }]}
      >
        <div className="space-y-6">
          {/* Status geral + Atualizar agora */}
          <Card className="card-soft border-border">
            <CardHeader className="pb-2">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Status geral
                </CardTitle>
                <div className="flex flex-wrap items-center gap-3">
                  {loading ? (
                    <Badge variant="secondary" className="rounded-lg">
                      Verificando...
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className={`rounded-lg border ${STATUS_BADGE_STYLES[overallStatus]}`}
                    >
                      {STATUS_LABELS[overallStatus]}
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl gap-2"
                    onClick={refetch}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Atualizar agora
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Serviços com latência por linha */}
          {loading ? (
            <LoadingSkeleton variant="cards" />
          ) : (
            <Card className="card-soft border-border overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base">Serviços</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Status e latência de cada componente
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {CARD_CONFIG.map(({ key, title, icon: Icon }) => {
                  const result = statusMap[key];
                  const ok = result.ok;
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between py-3 border-b border-border/50 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                        <span className="font-medium text-foreground">{title}</span>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <Badge
                          variant="secondary"
                          className={
                            ok
                              ? "rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : "rounded-lg bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30"
                          }
                        >
                          {ok ? "OK" : "Erro"}
                        </Badge>
                        {ok && result.latencyMs != null && (
                          <span className="text-sm text-muted-foreground tabular-nums w-14 text-right">
                            {result.latencyMs}ms
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Gráfico de Latência */}
          {!loading && (
            <Card className="card-soft border-border overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Latência ao longo do tempo
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Últimos 30 registros (coletados a cada 30 segundos)
                </p>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <div className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          unit="ms"
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "12px",
                            color: "hsl(var(--foreground))",
                          }}
                          formatter={(value: number, name: string) => {
                            const label =
                              name === "api"
                                ? "Latência API"
                                : name === "database"
                                  ? "Latência Database"
                                  : "Latência Web";
                            return [`${value}ms`, label];
                          }}
                          labelFormatter={(label) => `Registro ${label}`}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: 12 }}
                          formatter={(value) =>
                            value === "api"
                              ? "Latência API"
                              : value === "database"
                                ? "Latência Database"
                                : "Latência Web"
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="api"
                          name="api"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={false}
                          connectNulls
                        />
                        <Line
                          type="monotone"
                          dataKey="database"
                          name="database"
                          stroke="hsl(142, 71%, 45%)"
                          strokeWidth={2}
                          dot={false}
                          connectNulls
                        />
                        <Line
                          type="monotone"
                          dataKey="web"
                          name="web"
                          stroke="hsl(262, 83%, 58%)"
                          strokeWidth={2}
                          dot={false}
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-8 text-center">
                    Aguardando dados... O gráfico será preenchido conforme as verificações (a cada 30s).
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Uptime e Version */}
          {!loading && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="card-soft border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Timer className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Uptime</p>
                      <p className="text-2xl font-semibold text-foreground tabular-nums">
                        {uptime ?? "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="card-soft border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Versão</p>
                      <p className="text-2xl font-semibold text-foreground tabular-nums">
                        {version ?? "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Atualização automática a cada 30 segundos.
          </p>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
};

export default SystemHealth;
