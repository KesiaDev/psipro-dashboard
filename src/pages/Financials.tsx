import { DashboardLayout } from "@/components/DashboardLayout";
import { PageContainer } from "@/components/PageContainer";
import { useClinic } from "@/contexts/ClinicContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Receipt, CreditCard, Wallet, Trash2, CheckCircle } from "lucide-react";
import { useFinancialRecords } from "@/hooks/useFinancialRecords";
import { usePatients } from "@/hooks/usePatients";
import { AddFinancialRecordDialog } from "@/components/financials/AddFinancialRecordDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusColors = {
  paid: "confirmed" as const,
  pending: "pending" as const,
  overdue: "cancelled" as const,
  cancelled: "secondary" as const,
};
const statusLabels = { paid: "Pago", pending: "Pendente", overdue: "Atrasado", cancelled: "Cancelado" };

const categoryLabels: Record<string, string> = {
  session: "Sessão",
  evaluation: "Avaliação",
  package: "Pacote",
  rent: "Aluguel",
  salary: "Salário",
  supplies: "Material",
  other: "Outro",
};

const paymentMethodLabels: Record<string, string> = {
  pix: "PIX",
  cash: "Dinheiro",
  credit_card: "Cartão Crédito",
  debit_card: "Cartão Débito",
  bank_transfer: "Transferência",
  other: "Outro",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const Financials = () => {
  const { selectedClinic, userRole } = useClinic();
  const { records, loading, addRecord, updateRecord, deleteRecord, stats } = useFinancialRecords();
  const { patients } = usePatients();

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
        subtitle="Controle financeiro da clínica"
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Financeiro" }]}
        actions={<AddFinancialRecordDialog patients={patients} onSave={addRecord} />}
      >
        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Receita Total", value: stats.totalIncome, icon: DollarSign, positive: true },
            { label: "Despesas", value: stats.totalExpenses, icon: Receipt, positive: false },
            { label: "Lucro Líquido", value: stats.netProfit, icon: TrendingUp, positive: stats.netProfit >= 0 },
            { label: "Pendente", value: stats.totalPending, icon: CreditCard, positive: false },
          ].map((kpi) => (
            <Card key={kpi.label} className="bg-card border-border">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                    <kpi.icon className="h-5 w-5 text-accent-foreground" />
                  </div>
                  {kpi.positive ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-400" />
                  )}
                </div>
                {loading ? (
                  <Skeleton className="h-8 w-28" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(kpi.value)}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Transactions table */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Registros Financeiros</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Nenhum registro financeiro ainda.</p>
                <p className="text-xs text-muted-foreground mt-1">Clique em "Novo Registro" para começar.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                      <th className="pb-3 pr-4">Tipo</th>
                      <th className="pb-3 pr-4">Descrição</th>
                      <th className="pb-3 pr-4">Paciente</th>
                      <th className="pb-3 pr-4">Categoria</th>
                      <th className="pb-3 pr-4">Valor</th>
                      <th className="pb-3 pr-4">Pagamento</th>
                      <th className="pb-3 pr-4">Status</th>
                      <th className="pb-3 pr-4">Data</th>
                      <th className="pb-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((r) => (
                      <tr key={r.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3 pr-4">
                          <Badge variant="secondary" className={`text-[10px] ${r.type === "income" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                            {r.type === "income" ? "Receita" : "Despesa"}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 font-medium text-foreground max-w-[200px] truncate">{r.description}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{r.patient_name || "—"}</td>
                        <td className="py-3 pr-4 text-muted-foreground">{categoryLabels[r.category] || r.category}</td>
                        <td className="py-3 pr-4 font-medium text-foreground">{formatCurrency(Number(r.amount))}</td>
                        <td className="py-3 pr-4 text-muted-foreground text-xs">
                          {r.payment_method ? paymentMethodLabels[r.payment_method] || r.payment_method : "—"}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={statusColors[r.status as keyof typeof statusColors]} className="text-[10px]">
                            {statusLabels[r.status as keyof typeof statusLabels]}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground text-xs">
                          {format(new Date(r.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-1">
                            {r.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-lg text-emerald-400 hover:text-emerald-300"
                                title="Marcar como pago"
                                onClick={() => updateRecord(r.id, { status: "paid", paid_at: new Date().toISOString() })}
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-lg text-destructive hover:text-destructive"
                              title="Excluir"
                              onClick={() => deleteRecord(r.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </PageContainer>
    </DashboardLayout>
  );
};

export default Financials;
