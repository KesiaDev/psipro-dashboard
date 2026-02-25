import { DashboardLayout } from "@/components/DashboardLayout";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Users, CalendarDays, TrendingUp, Clock, Download, FileText, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const monthlyData = [
  { month: "Set", sessoes: 28 },
  { month: "Out", sessoes: 35 },
  { month: "Nov", sessoes: 32 },
  { month: "Dez", sessoes: 25 },
  { month: "Jan", sessoes: 38 },
  { month: "Fev", sessoes: 30 },
];

const revenueData = [
  { month: "Set", valor: 8400 },
  { month: "Out", valor: 10500 },
  { month: "Nov", valor: 9600 },
  { month: "Dez", valor: 7500 },
  { month: "Jan", valor: 11400 },
  { month: "Fev", valor: 9000 },
];

const typeData = [
  { name: "Individual", value: 65, color: "hsl(42, 52%, 53%)" },
  { name: "Casal", value: 15, color: "hsl(210, 60%, 55%)" },
  { name: "Avaliação", value: 12, color: "hsl(350, 70%, 60%)" },
  { name: "Retorno", value: 8, color: "hsl(0, 0%, 55%)" },
];

const topPatients = [
  { name: "Ana Souza", sessions: 12, percentage: 80 },
  { name: "Diego Santos", sessions: 15, percentage: 100 },
  { name: "Helena Costa", sessions: 10, percentage: 67 },
  { name: "Beatriz Ferreira", sessions: 8, percentage: 53 },
  { name: "Carlos Lima", sessions: 5, percentage: 33 },
];

const Reports = () => {
  return (
    <DashboardLayout title="Relatórios">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Relatórios</h1>
            <p className="text-sm text-muted-foreground">Análise de performance da clínica</p>
          </div>
          <Button variant="secondary" className="rounded-xl gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Sessões" value="188" change="+12% vs. semestre anterior" changeType="positive" icon={CalendarDays} />
          <StatCard title="Pacientes Ativos" value="48" change="+8 novos este semestre" changeType="positive" icon={Users} />
          <StatCard title="Taxa de Retorno" value="92%" change="+4% vs. período anterior" changeType="positive" icon={TrendingUp} />
          <StatCard title="Média por Semana" value="7.5h" change="Atendimento semanal" changeType="neutral" icon={Clock} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sessions Chart */}
          <div className="card-soft p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading text-base font-semibold text-foreground">Sessões por Mês</h3>
                <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
              </div>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
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
                <Bar dataKey="sessoes" fill="hsl(42, 52%, 53%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Chart */}
          <div className="card-soft p-6 animate-fade-in" style={{ animationDelay: "0.15s" }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-heading text-base font-semibold text-foreground">Faturamento</h3>
                <p className="text-xs text-muted-foreground">Evolução mensal (R$)</p>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
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
                <Line type="monotone" dataKey="valor" stroke="hsl(42, 52%, 53%)" strokeWidth={2} dot={{ fill: "hsl(42, 52%, 53%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Types */}
          <div className="card-soft p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <h3 className="font-heading text-base font-semibold text-foreground mb-6">Tipos de Sessão</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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
          </div>

          {/* Top Patients */}
          <div className="lg:col-span-2 card-soft p-6 animate-fade-in" style={{ animationDelay: "0.25s" }}>
            <h3 className="font-heading text-base font-semibold text-foreground mb-5">Pacientes Mais Ativos</h3>
            <div className="space-y-4">
              {topPatients.map((p) => (
                <div key={p.name} className="flex items-center gap-4">
                  <p className="text-sm font-medium text-foreground w-36 truncate">{p.name}</p>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full gold-gradient transition-all duration-500"
                      style={{ width: `${p.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-foreground w-16 text-right">{p.sessions} sess.</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
