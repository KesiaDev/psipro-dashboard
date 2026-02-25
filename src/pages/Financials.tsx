import { DashboardLayout } from "@/components/DashboardLayout";
import { PageContainer } from "@/components/PageContainer";
import { useClinic } from "@/contexts/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Receipt, CreditCard, Wallet } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

const monthlyRevenue = [
  { month: "Set", receita: 28500, despesas: 12000 },
  { month: "Out", receita: 32000, despesas: 11500 },
  { month: "Nov", receita: 35200, despesas: 13000 },
  { month: "Dez", receita: 30800, despesas: 14200 },
  { month: "Jan", receita: 38500, despesas: 12800 },
  { month: "Fev", receita: 41200, despesas: 13500 },
];

const revenueByProfessional = [
  { name: "Dra. Maria Costa", value: 12800 },
  { name: "Dr. Rafael Mendes", value: 9600 },
  { name: "Dra. Ana Oliveira", value: 8400 },
  { name: "Dra. Julia Santos", value: 7200 },
  { name: "Dr. Pedro Alves", value: 3200 },
];

const GOLD_SHADES = [
  "hsl(42, 52%, 53%)",
  "hsl(42, 45%, 45%)",
  "hsl(42, 40%, 60%)",
  "hsl(42, 35%, 35%)",
  "hsl(42, 30%, 70%)",
];

const recentTransactions = [
  { id: "1", patient: "João Silva", professional: "Dra. Maria Costa", type: "Sessão Individual", amount: 280, status: "paid", date: "25/02/2026" },
  { id: "2", patient: "Ana Souza", professional: "Dr. Rafael Mendes", type: "Sessão Individual", amount: 320, status: "paid", date: "25/02/2026" },
  { id: "3", patient: "Carlos Oliveira", professional: "Dra. Ana Oliveira", type: "Avaliação", amount: 450, status: "pending", date: "24/02/2026" },
  { id: "4", patient: "Maria Santos", professional: "Dra. Maria Costa", type: "Sessão de Casal", amount: 380, status: "paid", date: "24/02/2026" },
  { id: "5", patient: "Pedro Lima", professional: "Dr. Rafael Mendes", type: "Sessão Individual", amount: 280, status: "overdue", date: "20/02/2026" },
];

const statusColors = {
  paid: "confirmed" as const,
  pending: "pending" as const,
  overdue: "cancelled" as const,
};
const statusLabels = { paid: "Pago", pending: "Pendente", overdue: "Atrasado" };

const Financials = () => {
  const { selectedClinic, userRole } = useClinic();

  if (userRole === "psychologist") {
    return (
      <DashboardLayout title="Financeiro">
        <PageContainer title="Financeiro" subtitle="Acesso restrito">
          <Card className="bg-card border-border p-12 text-center">
            <Wallet className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <h3 className="mt-4 font-heading text-lg font-semibold text-foreground">Acesso Restrito</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Apenas proprietários e administradores podem visualizar o painel financeiro.
            </p>
          </Card>
        </PageContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Financeiro">
      <PageContainer
        title={`Financeiro — ${selectedClinic.name}`}
        subtitle="Visão geral financeira da clínica"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Financeiro" }]}
      >
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Receita Mensal", value: "R$ 41.200", change: "+7%", positive: true, icon: DollarSign },
            { label: "Despesas", value: "R$ 13.500", change: "+5.5%", positive: false, icon: Receipt },
            { label: "Lucro Líquido", value: "R$ 27.700", change: "+8.2%", positive: true, icon: TrendingUp },
            { label: "Inadimplência", value: "3.2%", change: "-1.1%", positive: true, icon: CreditCard },
          ].map((kpi) => (
            <Card key={kpi.label} className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                    <kpi.icon className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${kpi.positive ? "text-emerald-400" : "text-red-400"}`}>
                    {kpi.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {kpi.change}
                  </div>
                </div>
                <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Receita vs Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 15%)" />
                    <XAxis dataKey="month" stroke="hsl(0, 0%, 55%)" fontSize={12} />
                    <YAxis stroke="hsl(0, 0%, 55%)" fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{ background: "hsl(0, 0%, 9%)", border: "1px solid hsl(0, 0%, 15%)", borderRadius: "12px" }}
                      labelStyle={{ color: "hsl(0, 0%, 93%)" }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString()}`, ""]}
                    />
                    <Bar dataKey="receita" fill="hsl(42, 52%, 53%)" radius={[6, 6, 0, 0]} name="Receita" />
                    <Bar dataKey="despesas" fill="hsl(0, 0%, 25%)" radius={[6, 6, 0, 0]} name="Despesas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Receita por Profissional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={revenueByProfessional} cx="50%" cy="50%" outerRadius={80} innerRadius={45} dataKey="value" paddingAngle={3}>
                      {revenueByProfessional.map((_, i) => (
                        <Cell key={i} fill={GOLD_SHADES[i % GOLD_SHADES.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: "hsl(0, 0%, 9%)", border: "1px solid hsl(0, 0%, 15%)", borderRadius: "12px" }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString()}`, ""]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {revenueByProfessional.map((p, i) => (
                  <div key={p.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: GOLD_SHADES[i] }} />
                      <span className="text-muted-foreground truncate max-w-[120px]">{p.name}</span>
                    </div>
                    <span className="font-medium text-foreground">R$ {p.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent transactions */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3 pr-4">Paciente</th>
                    <th className="pb-3 pr-4">Profissional</th>
                    <th className="pb-3 pr-4">Tipo</th>
                    <th className="pb-3 pr-4">Valor</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((t) => (
                    <tr key={t.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 pr-4 font-medium text-foreground">{t.patient}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{t.professional}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{t.type}</td>
                      <td className="py-3 pr-4 font-medium text-foreground">R$ {t.amount}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={statusColors[t.status as keyof typeof statusColors]} className="text-[10px]">
                          {statusLabels[t.status as keyof typeof statusLabels]}
                        </Badge>
                      </td>
                      <td className="py-3 text-muted-foreground">{t.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </PageContainer>
    </DashboardLayout>
  );
};

export default Financials;
