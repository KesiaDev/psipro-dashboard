import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageContainer } from "@/components/PageContainer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Camera, Bell, Shield, Clock, Smartphone, Accessibility } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const Settings = () => {
  const { profile, loading, error, refetch, updateProfile, updatePassword } = useProfile();
  const { highContrast, enlargedFont, textSpacing, largeButtons, setHighContrast, setEnlargedFont, setTextSpacing, setLargeButtons } = useAccessibility();
  const [profileForm, setProfileForm] = useState({ name: "", crp: "", email: "", phone: "", specialties: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    reminder: true,
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        name: profile.name ?? "",
        crp: profile.crp ?? "",
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        specialties: profile.specialties ?? "",
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      await updateProfile(profileForm);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      return;
    }
    setPasswordSaving(true);
    try {
      const ok = await updatePassword(currentPassword, newPassword);
      if (ok) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  if (error && !profile) {
    return (
      <DashboardLayout title="Configurações">
        <ErrorState title="Erro ao carregar perfil" message={(error as { message?: string }).message ?? ""} onRetry={refetch} />
      </DashboardLayout>
    );
  }

  if (loading && !profile) {
    return (
      <DashboardLayout title="Configurações">
        <LoadingSkeleton variant="page" />
      </DashboardLayout>
    );
  }

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
            <TabsTrigger value="accessibility" className="rounded-lg data-[state=active]:bg-accent data-[state=active]:text-accent-foreground px-4 py-2 text-sm">
              Acessibilidade
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="card-soft p-6">
              <h3 className="font-heading text-base font-semibold text-foreground mb-6">Informações Pessoais</h3>
              <div className="flex items-center gap-6 mb-8">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="gold-gradient text-primary-foreground text-xl font-bold">
                      {getInitials(profileForm.name || "U")}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors">
                    <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
                <div>
                  <p className="font-heading text-lg font-semibold text-foreground">{profileForm.name || "Usuário"}</p>
                  <p className="text-sm text-muted-foreground">
                    {profileForm.crp ? `${profileForm.crp} · ` : ""}Perfil
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="profile-name" className="text-sm text-muted-foreground">Nome completo</Label>
                  <Input
                    id="profile-name"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                    className="input-premium"
                    aria-label="Nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-crp" className="text-sm text-muted-foreground">CRP</Label>
                  <Input
                    id="profile-crp"
                    value={profileForm.crp}
                    onChange={(e) => setProfileForm((p) => ({ ...p, crp: e.target.value }))}
                    className="input-premium"
                    aria-label="Registro CRP"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-email" className="text-sm text-muted-foreground">E-mail</Label>
                  <Input
                    id="profile-email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                    className="input-premium"
                    aria-label="E-mail"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-phone" className="text-sm text-muted-foreground">Telefone</Label>
                  <Input
                    id="profile-phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                    className="input-premium"
                    aria-label="Telefone"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="profile-specialties" className="text-sm text-muted-foreground">Especialidades</Label>
                  <Input
                    id="profile-specialties"
                    value={profileForm.specialties}
                    onChange={(e) => setProfileForm((p) => ({ ...p, specialties: e.target.value }))}
                    placeholder="TCC, Terapia de Casal..."
                    className="input-premium"
                    aria-label="Especialidades"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button variant="gold" className="rounded-xl gap-2" onClick={handleSaveProfile} disabled={profileSaving}>
                  <Save className="h-4 w-4" /> {profileSaving ? "Salvando..." : "Salvar Alterações"}
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
                  <Label htmlFor="current-password" className="text-sm text-muted-foreground">Senha atual</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-premium"
                    aria-label="Senha atual"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="new-password" className="text-sm text-muted-foreground">Nova senha</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-premium"
                      aria-label="Nova senha"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm text-muted-foreground">Confirmar nova senha</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-premium"
                      aria-label="Confirmar nova senha"
                    />
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
                <Button variant="gold" className="rounded-xl gap-2" onClick={handleUpdatePassword} disabled={passwordSaving}>
                  <Save className="h-4 w-4" /> {passwordSaving ? "Atualizando..." : "Atualizar Senha"}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Accessibility Tab */}
          <TabsContent value="accessibility" className="space-y-6">
            <div className="card-soft p-6">
              <div className="flex items-center gap-3 mb-6">
                <Accessibility className="h-5 w-5 text-primary" />
                <h3 className="font-heading text-base font-semibold text-foreground">Acessibilidade</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                Modo de baixa visão e acessibilidade. Ajuste as opções para leitores de tela (NVDA, VoiceOver, JAWS) e leitura visual.
              </p>
              <div className="space-y-5">
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">Alto contraste</p>
                    <p className="text-xs text-muted-foreground">Aumenta o contraste de cores conforme WCAG 2.1 nível AA</p>
                  </div>
                  <Switch checked={highContrast} onCheckedChange={setHighContrast} aria-label="Ativar alto contraste" />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">Fonte ampliada</p>
                    <p className="text-xs text-muted-foreground">Aumenta o tamanho padrão do texto</p>
                  </div>
                  <Switch checked={enlargedFont} onCheckedChange={setEnlargedFont} aria-label="Ativar fonte ampliada" />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">Espaçamento de texto</p>
                    <p className="text-xs text-muted-foreground">Aumenta espaçamento entre letras e linhas</p>
                  </div>
                  <Switch checked={textSpacing} onCheckedChange={setTextSpacing} aria-label="Ativar espaçamento de texto" />
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">Botões maiores</p>
                    <p className="text-xs text-muted-foreground">Aumenta o tamanho dos botões para facilitar o clique</p>
                  </div>
                  <Switch checked={largeButtons} onCheckedChange={setLargeButtons} aria-label="Ativar botões maiores" />
                </div>
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
                {/* PsiPro App - Conectado */}
                <div className="flex items-center justify-between py-4 border-b border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-primary/10">
                      <Smartphone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">PsiPro App</p>
                      <p className="text-xs text-muted-foreground">Conecte com o aplicativo mobile PsiPro. Web e App compartilham o mesmo backend.</p>
                    </div>
                  </div>
                  <Button
                    variant="outline-gold"
                    size="sm"
                    className="rounded-xl gap-2"
                    onClick={() => {
                      try {
                        window.open("psipro://open", "_blank", "noopener");
                      } catch {
                        window.location.href = "psipro://open";
                      }
                    }}
                    aria-label="Abrir PsiPro no aplicativo mobile"
                  >
                    <Smartphone className="h-4 w-4" />
                    Abrir no app
                  </Button>
                </div>
                <div className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground space-y-2">
                  <p className="font-medium text-foreground">Como conectar</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Abra o PsiPro App no celular e faça login com as mesmas credenciais desta conta.</li>
                    <li>No App, use &quot;Plataforma Web&quot; ou &quot;Abrir Web&quot; — o App abrirá o dashboard automaticamente com sua sessão.</li>
                    <li>Se não abrir, o deeplink &quot;Abrir no app&quot; acima tenta abrir o App (se instalado).</li>
                  </ul>
                </div>
                {[
                  { name: "Google Calendar", desc: "Sincronize sua agenda com o Google Calendar" },
                  { name: "WhatsApp Business", desc: "Envie lembretes e mensagens automatizadas" },
                  { name: "Gateway de Pagamento", desc: "Receba pagamentos online dos pacientes" },
                ].map((item) => (
                  <div key={item.name} className="flex items-center justify-between py-4 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-muted">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                    <Button variant="outline-gold" size="sm" className="rounded-xl" disabled>
                      Em breve
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
