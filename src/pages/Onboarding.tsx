import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PsiProLogo } from "@/components/PsiProLogo";
import { Check, ChevronRight } from "lucide-react";

const PROFESSIONAL_TYPES = ["Psicólogo", "Terapeuta", "Psicanalista", "Conselheiro", "Coach", "Outro"];

const BR_STATES = ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"];

const GOALS = [
  "Organizar meu prontuário e registros",
  "Crescer minha carteira de pacientes",
  "Usar IA para análise de sessões",
  "Melhorar controle financeiro",
  "Facilitar agendamentos",
  "Trabalhar offline com sincronização",
];

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

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Step 1
  const [professionalType, setProfessionalType] = useState("");
  const [crp, setCrp] = useState("");

  // Step 2
  const [clinicName, setClinicName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Step 3
  const [goals, setGoals] = useState<string[]>([]);

  const toggleGoal = (goal: string) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleSkip = () => {
    localStorage.setItem("psipro_onboarding", "skipped");
    navigate("/");
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep((s) => s + 1);
    }
  };

  const handlePlanSelect = (planId: string) => {
    localStorage.setItem("psipro_onboarding", "completed");
    navigate(`/billing?plan=${planId}`);
  };

  const progress = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <PsiProLogo size="lg" />
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Passo {step} de {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div
                key={s}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium border-2 transition-all ${
                  s < step
                    ? "bg-primary border-primary text-primary-foreground"
                    : s === step
                    ? "border-primary text-primary bg-background"
                    : "border-muted text-muted-foreground bg-background"
                }`}
              >
                {s < step ? <Check className="w-3 h-3" /> : s}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1 — Perfil profissional */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Bem-vindo ao PsiPro! 👋</CardTitle>
              <CardDescription>Vamos configurar seu perfil profissional</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tipo de profissional</Label>
                <Select value={professionalType} onValueChange={setProfessionalType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua especialidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFESSIONAL_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="crp">CRP (opcional)</Label>
                <Input
                  id="crp"
                  placeholder="Ex: 06/123456"
                  value={crp}
                  onChange={(e) => setCrp(e.target.value)}
                />
              </div>
              <Button className="w-full" onClick={handleNext} disabled={!professionalType}>
                Continuar <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2 — Clínica */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Sua Clínica 🏥</CardTitle>
              <CardDescription>Onde você atende seus pacientes?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="clinic-name">Nome da clínica / consultório</Label>
                <Input
                  id="clinic-name"
                  placeholder="Ex: Consultório Dra. Ana Silva"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    placeholder="Ex: São Paulo"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select value={state} onValueChange={setState}>
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {BR_STATES.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full" onClick={handleNext}>
                Continuar <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3 — Metas */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Suas metas 🎯</CardTitle>
              <CardDescription>O que você quer alcançar com o PsiPro?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {GOALS.map((goal) => (
                  <div key={goal} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer" onClick={() => toggleGoal(goal)}>
                    <Checkbox
                      checked={goals.includes(goal)}
                      onCheckedChange={() => toggleGoal(goal)}
                    />
                    <span className="text-sm">{goal}</span>
                  </div>
                ))}
              </div>
              <Button className="w-full" onClick={handleNext}>
                Continuar <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4 — Planos */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold">Escolha seu plano 🚀</h2>
              <p className="text-muted-foreground mt-1">14 dias grátis, sem cartão de crédito</p>
            </div>
            <div className="grid gap-4">
              {PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all hover:border-primary ${
                    plan.highlight ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
                  }`}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{plan.name}</h3>
                          {plan.badge && (
                            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        <ul className="mt-2 space-y-1">
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Check className="w-3 h-3 text-primary shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <span className="text-2xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground text-sm">{plan.period}</span>
                      </div>
                    </div>
                    <Button className="w-full mt-4" variant={plan.highlight ? "default" : "outline"}>
                      Começar grátis por 14 dias
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Skip link */}
        <div className="text-center mt-4">
          <button
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
            onClick={handleSkip}
          >
            Pular por agora
          </button>
        </div>
      </div>
    </div>
  );
}
