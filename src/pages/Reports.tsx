import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Users, CalendarDays, TrendingUp, Clock, Download } from "lucide-react";
import { exportReportsToPdf } from "@/utils/exportReportsPdf";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { useReportsData } from "@/hooks/useReportsData";
import { ErrorState } from "@/components/ErrorState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { reportChartColor, REPORTS_REVENUE_LINE } from "@/constants/reportsChart";

const Reports = () => {
  const { data, loading, error, refetch } = useReportsData();

  const handleExportPdf = () => {
    const stats = data?.stats ?? { totalSessions: 0, activePatients: 0, returnRate: 0, avgHoursPerWeek: 0 };
    const topPatients = data?.topPatients ?? [];
    const monthlySessions = data?.monthlySessions ?? [];
    const revenueData = data?.revenueData ?? [];
    const typeData = data?.typeData ?? [];
    exportReportsToPdf({ stats, topPatients, monthlySessions, revenueData, typeData }, null);
  };

  if (error) {
    const err = error as { status?: number; message?: string };
    return (
      <DashboardLayout title="Relatórios">
        <ErrorState
          title={err.status === 401 ? "Sessão expirada" : err.status === 403 ? "Acesso negado" : "Erro ao carregar relatórios"}
          message={err.message ?? "Não foi possível carregar os dados."}
          status={err.status}
          onRetry={refetch}
        />
      </DashboardLayout>
    );
  }

  if (loading && !data) {
    return (
      <DashboardLayout title="Relatórios">
        <LoadingSkeleton variant="page" />
      </DashboardLayout>
    );
  }

  const monthlyData = data?.monthlySessions ?? [];
  const revenueData = data?.revenueData ?? [];
  const typeData = data?.typeData ?? [];
  const topPatients = data?.topPatients ?? [];
  const stats = data?.stats ?? {
    totalSessions: 0,
    activePatients: 0,
    returnRate: 0,
    avgHoursPerWeek: 0,
  };

  return (
    <DashboardLayout title="Relatórios">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Relatórios</h1>
            <p className="text-sm text-muted-foreground">Análise de performance da clínica</p>
          </div>
          <Button variant="secondary" className="rounded-xl gap-2" onClick={handleExportPdf}>
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>

        {/* Stats - da API */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Sessões"
            value={String(stats.totalSessions)}
            change="vs. semestre anterior"
            changeType="neutral"
            icon={CalendarDays}
          />
          <StatCard
            title="Pacientes Ativos"
            value={String(stats.activePatients)}
            change="cadastrados"
            changeType="neutral"
            icon={Users}
          />
          <StatCard
            title="Taxa de Retorno"
            value={`${stats.returnRate}%`}
            change="vs. período anterior"
            changeType="neutral"
            icon={TrendingUp}
          />
          <StatCard
            title="Média por Semana"
            value={`${stats.avgHoursPerWeek}h`}
            change="Atendimento semanal"
            changeType="neutral"
            icon={Clock}
          />
        </div>

        {/* Charts - dados da API */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-soft p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading text-base font-semibold text-foreground">Sessões por Mês</h3>
                <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
              </div>
            </div>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 15%)" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 9%)",
                      border: "1px solid hsl(0, 0%, 15%)",
                      borderRadius: "12px",
                      color: "hsl(0, 0%, 93%)",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="sessoes" radius={[6, 6, 0, 0]}>
                    {monthlyData.map((_, index) => (
                      <Cell key={`month-bar-${index}`} fill={reportChartColor(index)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                Nenhum dado disponível
              </div>
            )}
          </div>

          <div className="card-soft p-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading text-base font-semibold text-foreground">Faturamento</h3>
                <p className="text-xs text-muted-foreground">Evolução mensal (R$)</p>
              </div>
            </div>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 15%)" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(0, 0%, 55%)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 9%)",
                      border: "1px solid hsl(0, 0%, 15%)",
                      borderRadius: "12px",
                      color: "hsl(0, 0%, 93%)",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString()}`, "Valor"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke={REPORTS_REVENUE_LINE}
                    strokeWidth={2}
                    dot={{ fill: REPORTS_REVENUE_LINE, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
                Nenhum dado disponível
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card-soft p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h3 className="font-heading text-base font-semibold text-foreground mb-6">Tipos de Sessão</h3>
            {typeData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color ?? reportChartColor(index)} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 9%)",
                        border: "1px solid hsl(0, 0%, 15%)",
                        borderRadius: "12px",
                        color: "hsl(0, 0%, 93%)",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [`${value}%`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {typeData.map((t) => (
                    <div key={t.name} className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                      <span className="text-xs text-muted-foreground">{t.name} ({t.value}%)</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                Nenhum dado disponível
              </div>
            )}
          </div>

          <div className="lg:col-span-2 card-soft p-6 animate-fade-in" style={{ animationDelay: "0.25s" }}>
            <h3 className="font-heading text-base font-semibold text-foreground mb-5">Pacientes Mais Ativos</h3>
            {topPatients.length > 0 ? (
              <div className="space-y-4">
                {topPatients.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-4">
                    <p className="text-sm font-medium text-foreground w-36 truncate">{p.name}</p>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, p.percentage)}%`,
                          backgroundColor: reportChartColor(i),
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground w-16 text-right">{p.sessions} sess.</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Nenhum dado disponível
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
