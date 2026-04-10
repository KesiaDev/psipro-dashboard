import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { api } from "@/services/api";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "R$79",
    period: "/mês",
    features: ["1 profissional", "Até 50 pacientes", "Agenda e prontuários", "App Android"],
    highlight: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "R$149",
    period: "/mês",
    features: ["Até 3 profissionais", "Pacientes ilimitados", "IA nas sessões", "Relatórios avançados", "Suporte prioritário"],
    highlight: true,
    badge: "Mais popular",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "R$299",
    period: "/mês",
    features: ["Profissionais ilimitados", "Tudo do Pro", "Integrações", "Personalização", "Gerente de conta"],
    highlight: false,
  },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Ativo", color: "text-green-500" },
  PAST_DUE: { label: "Pagamento atrasado", color: "text-yellow-500" },
  CANCELED: { label: "Cancelado", color: "text-red-500" },
  NONE: { label: "Sem assinatura", color: "text-muted-foreground" },
};

export default function Billing() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const defaultPlan = searchParams.get("plan") || "pro";
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan);
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    api.get<any>("/subscriptions/me")
      .then((data) => setSubscription(data))
      .catch(() => setSubscription({ status: "NONE" }));
  }, []);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      toast({ title: "Assinatura ativada!", description: "Bem-vindo ao PsiPro Pro. Aproveite todos os recursos!" });
    }
    if (searchParams.get("canceled") === "true") {
      toast({ title: "Checkout cancelado", description: "Você pode assinar quando quiser.", variant: "destructive" });
    }
  }, [searchParams, toast]);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const data = await api.post<{ url: string }>("/subscriptions/checkout", { planId: selectedPlan });
      window.location.href = data.url;
    } catch (err: any) {
      toast({
        title: "Erro ao criar sessão de pagamento",
        description: err?.response?.data?.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManagePortal = async () => {
    setPortalLoading(true);
    try {
      const data = await api.post<{ url: string }>("/subscriptions/portal", {});
      window.location.href = data.url;
    } catch (err: any) {
      toast({
        title: "Erro ao abrir portal",
        description: err?.response?.data?.message || "Nenhuma assinatura ativa encontrada.",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  const currentStatus = subscription ? (STATUS_LABELS[subscription.status] || STATUS_LABELS.NONE) : null;
  const hasActiveSubscription = subscription?.status === "ACTIVE";

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Assinatura</h1>
          <p className="text-muted-foreground mt-1">Escolha o plano ideal para sua clínica</p>
        </div>

        {/* Status atual */}
        {subscription && (
          <Card className="mb-8">
            <CardContent className="flex items-center justify-between p-5">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Status da assinatura</p>
                  <p className={`text-sm ${currentStatus?.color}`}>{currentStatus?.label}</p>
                  {subscription.currentPeriodEnd && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Próxima cobrança: {new Date(subscription.currentPeriodEnd).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              </div>
              {hasActiveSubscription && (
                <Button variant="outline" onClick={handleManagePortal} disabled={portalLoading}>
                  {portalLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                  Gerenciar assinatura
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Planos */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`cursor-pointer transition-all ${
                selectedPlan === plan.id
                  ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "hover:border-primary/50"
              } ${plan.highlight ? "relative" : ""}`}
              onClick={() => setSelectedPlan(plan.id)}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full font-medium">
                    {plan.badge}
                  </span>
                </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Button size="lg" onClick={handleSubscribe} disabled={loading} className="w-full sm:w-auto min-w-48">
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Aguarde...</>
            ) : (
              <>Assinar {PLANS.find((p) => p.id === selectedPlan)?.name} — {PLANS.find((p) => p.id === selectedPlan)?.price}/mês</>
            )}
          </Button>
          <p className="text-sm text-muted-foreground">14 dias grátis · Cancele quando quiser</p>
        </div>
      </div>
    </div>
  );
}
