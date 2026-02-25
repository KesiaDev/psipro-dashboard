import { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageContainer } from "@/components/PageContainer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Camera, Bell, Shield, Clock, Smartphone } from "lucide-react";

const Settings = () => {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    reminder: true,
  });

  return (
    <DashboardLayout title="Configurações">
      <PageContainer
        title="Configurações"
        subtitle="Gerencie seu perfil e preferências"
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Configurações" },
        ]}
      >
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-card border border-border rounded-xl p-1 h-auto">
            <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground px-4 py-2 text-sm">
              Perfil
            </TabsTrigger>
            <TabsTrigger value="schedule" className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground px-4 py-2 text-sm">
              Horários
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground px-4 py-2 text-sm">
              Notificações
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground px-4 py-2 text-sm">
              Segurança
            </TabsTrigger>
            <TabsTrigger value="integrations" className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground px-4 py-2 text-sm">
              Integrações
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="card-soft p-6">
              <h3 className="font-heading text-base font-semibold text-foreground mb-6">Informações Pessoais</h3>
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="gold-gradient text-primary-foreground text-xl font-bold">MC</AvatarFallback>
                  </Avatar>
                  <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
                    <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
                <div>
                  <p className="font-heading text-lg font-semibold text-foreground">Dra. Maria Costa</p>
                  <p className="text-sm text-muted-foreground">CRP 06/12345 · Psicóloga Clínica</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Nome completo</Label>
                  <Input defaultValue="Maria Costa" className="input-premium" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">CRP</Label>
                  <Input defaultValue="06/12345" className="input-premium" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">E-mail</Label>
                  <Input defaultValue="maria.costa@psipro.com" type="email" className="input-premium" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Telefone</Label>
                  <Input defaultValue="(11) 99123-4567" className="input-premium" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm text-muted-foreground">Especialidades</Label>
                  <Input defaultValue="TCC, Terapia de Casal, Avaliação Neuropsicológica" className="input-premium" />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button variant="gold" className="rounded-xl gap-2">
                  <Save className="h-4 w-4" /> Salvar Alterações
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="card-soft p-6">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-heading text-base font-semibold text-foreground">Horário de Atendimento</h3>
              </div>
              <div className="space-y-4">
                {["Segunda", "Terça", "Quarta", "Quinta", "Sexta"].map((day) => (
                  <div key={day} className="flex items-center gap-4 py-3 border-b border-border/50 last:border-0">
                    <span className="w-24 text-sm font-medium text-foreground">{day}</span>
                    <Switch defaultChecked />
                    <div className="flex items-center gap-2">
                      <Input defaultValue="08:00" className="input-premium w-24 text-center text-sm" />
                      <span className="text-muted-foreground text-sm">até</span>
                      <Input defaultValue="18:00" className="input-premium w-24 text-center text-sm" />
                    </div>
                    <span className="text-xs text-muted-foreground ml-auto">50 min/sessão</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <Button variant="gold" className="rounded-xl gap-2">
                  <Save className="h-4 w-4" /> Salvar Horários
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="card-soft p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="font-heading text-base font-semibold text-foreground">Preferências de Notificação</h3>
              </div>
              <div className="space-y-5">
                {[
                  { key: "email" as const, label: "Notificações por e-mail", desc: "Receba atualizações sobre consultas por e-mail" },
                  { key: "push" as const, label: "Notificações push", desc: "Notificações no navegador e app mobile" },
                  { key: "sms" as const, label: "SMS", desc: "Alertas por mensagem de texto" },
                  { key: "reminder" as const, label: "Lembretes automáticos", desc: "Enviar lembretes aos pacientes antes das consultas" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key]}
                      onCheckedChange={(v) => setNotifications((prev) => ({ ...prev, [item.key]: v }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="card-soft p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="font-heading text-base font-semibold text-foreground">Segurança da Conta</h3>
              </div>
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Senha atual</Label>
                  <Input type="password" placeholder="••••••••" className="input-premium" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Nova senha</Label>
                    <Input type="password" placeholder="••••••••" className="input-premium" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Confirmar nova senha</Label>
                    <Input type="password" placeholder="••••••••" className="input-premium" />
                  </div>
                </div>
              </div>
              <Separator className="my-6" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Autenticação em dois fatores</p>
                  <p className="text-xs text-muted-foreground">Adicione uma camada extra de segurança</p>
                </div>
                <Button variant="outline-gold" className="rounded-xl" size="sm">Ativar</Button>
              </div>
              <div className="flex justify-end mt-6">
                <Button variant="gold" className="rounded-xl gap-2">
                  <Save className="h-4 w-4" /> Atualizar Senha
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="card-soft p-6">
              <div className="flex items-center gap-3 mb-6">
                <Smartphone className="h-5 w-5 text-primary" />
                <h3 className="font-heading text-base font-semibold text-foreground">Integrações</h3>
              </div>
              <div className="space-y-4">
                {[
                  { name: "PsiPro App", desc: "Conecte com o aplicativo mobile PsiPro", status: "Conectado", connected: true },
                  { name: "Google Calendar", desc: "Sincronize sua agenda com o Google Calendar", status: "Desconectado", connected: false },
                  { name: "WhatsApp Business", desc: "Envie lembretes e mensagens automatizadas", status: "Desconectado", connected: false },
                  { name: "Gateway de Pagamento", desc: "Receba pagamentos online dos pacientes", status: "Desconectado", connected: false },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${item.connected ? "gold-gradient" : "bg-muted"}`}>
                        <Smartphone className={`h-5 w-5 ${item.connected ? "text-primary-foreground" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <Button
                      variant={item.connected ? "secondary" : "outline-gold"}
                      size="sm"
                      className="rounded-xl"
                    >
                      {item.connected ? "Gerenciar" : "Conectar"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </PageContainer>
    </DashboardLayout>
  );
};

export default Settings;
