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
  CheckCircle2,
  XCircle,
  RefreshCw,
  Activity,
  Clock,
} from "lucide-react";
import { useSystemHealth } from "@/hooks/useSystemHealth";

const CARD_CONFIG = [
  {
    key: "backendApi" as const,
    title: "Backend API",
    subtitle: "GET /patients?limit=1",
    icon: Server,
  },
  {
    key: "database" as const,
    title: "Database",
    subtitle: "GET /appointments?limit=1",
    icon: Database,
  },
  {
    key: "mobileSync" as const,
    title: "Mobile Sync",
    subtitle: "GET /sessions?limit=1",
    icon: Smartphone,
  },
  {
    key: "webSync" as const,
    title: "Web Sync",
    subtitle: "GET /financial/records?limit=1",
    icon: Globe,
  },
];

const SystemHealth = () => {
  const {
    backendApi,
    database,
    mobileSync,
    webSync,
    overallStatus,
    averageLatencyMs,
    loading,
    refetch,
  } = useSystemHealth();

  const statusMap = { backendApi, database, mobileSync, webSync };

  const statusBadge =
    overallStatus === "healthy"
      ? { label: "Operacional", className: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" }
      : overallStatus === "degraded"
        ? { label: "Degradado", className: "bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30" }
        : { label: "Indisponível", className: "bg-destructive/20 text-destructive border-destructive/30" };

  return (
    <DashboardLayout title="Saúde do Sistema">
      <PageContainer
        title="Saúde do Sistema"
        subtitle="Monitoramento do backend e sincronização com o app mobile"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Saúde do Sistema" }]}
      >
        <div className="space-y-6">
          {/* Resumo geral */}
          <Card className="card-soft border-border">
            <CardHeader className="pb-2">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Status do backend
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={`rounded-lg border ${statusBadge.className}`}>
                    {statusBadge.label}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Latência média: {averageLatencyMs}ms</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl gap-2"
                    onClick={refetch}
                    disabled={loading}
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Atualizar
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Cards de status */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CARD_CONFIG.map(({ key, title, subtitle, icon: Icon }) => {
              const result = statusMap[key];
              const ok = result.ok;
              return (
                <Card key={key} className="card-soft border-border overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      {ok ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" aria-label="OK" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" aria-label="Erro" />
                      )}
                    </div>
                    <CardTitle className="text-base">{title}</CardTitle>
                    <p className="text-xs text-muted-foreground">{subtitle}</p>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <Badge variant="secondary" className="rounded-lg">
                        Verificando...
                      </Badge>
                    ) : ok ? (
                      <div className="space-y-1">
                        <Badge
                          variant="secondary"
                          className="rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        >
                          OK
                        </Badge>
                        {result.latencyMs != null && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {result.latencyMs}ms
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Badge
                          variant="secondary"
                          className="rounded-lg bg-destructive/20 text-destructive border-destructive/30"
                        >
                          Erro
                        </Badge>
                        {result.error && (
                          <p className="text-xs text-destructive mt-1 truncate" title={result.error}>
                            {result.error}
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">
            Atualização automática a cada 30 segundos.
          </p>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
};

export default SystemHealth;
