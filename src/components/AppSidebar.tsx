import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  MessageSquare,
  Settings,
  Building2,
  UserCheck,
  DollarSign,
  LogOut,
  Activity,
  CreditCard,
  MessageCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClinic } from "@/contexts/ClinicContext";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/contexts/AuthContext";
import { PsiProLogo } from "@/components/PsiProLogo";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Clínicas", url: "/clinics", icon: Building2 },
  { title: "Profissionais", url: "/psychologists", icon: UserCheck },
  { title: "Pacientes", url: "/patients", icon: Users },
  { title: "Agenda", url: "/calendar", icon: CalendarDays },
  { title: "Sessões", url: "/sessions", icon: MessageSquare },
  { title: "Chat WhatsApp", url: "/chat", icon: MessageCircle },
  { title: "Financeiro", url: "/financials", icon: DollarSign },
  { title: "Relatórios", url: "/reports", icon: FileText },
  { title: "System Health", url: "/system-health", icon: Activity, developerOnly: true },
];

const bottomNav = [
  { title: "Configurações", url: "/settings", icon: Settings },
  { title: "Plano & Billing", url: "/billing", icon: CreditCard },
];

function getInitials(name: string): string {
  const trimmed = name?.trim() || "";
  if (!trimmed) return "?";
  return trimmed
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AppSidebar() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { signOut } = useAuth();
  const { userRole } = useClinic();

  const displayName = profile?.name?.trim() || "";
  const normalizedEmail = (profile?.email ?? "").trim().toLowerCase();
  const developerEmails = (import.meta.env.VITE_DEVELOPER_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  const isDeveloper = import.meta.env.DEV || developerEmails.includes(normalizedEmail);
  const displayProfessionalType = profile?.professionalType?.trim() || "";
  const displayCrp = profile?.crp?.trim() || "";
  const hasProfile = displayName || displayProfessionalType || displayCrp;

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar" role="navigation" aria-label="Menu principal">
      <SidebarHeader className="p-6 pb-4">
        <div className="flex items-center gap-3">
          <PsiProLogo size="sm" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav
                .filter((item) => {
                  if ("developerOnly" in item && item.developerOnly) return isDeveloper;
                  return !("adminOnly" in item && item.adminOnly) || userRole === "admin" || userRole === "owner";
                })
                .map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))
              }
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        <SidebarMenu>
          {bottomNav.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <div
          className="mt-3 flex items-center gap-3 rounded-xl bg-secondary p-3 cursor-pointer hover:bg-secondary/80 transition-colors"
          onClick={() => navigate("/settings")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate("/settings"); } }}
          tabIndex={0}
          role="button"
          aria-label={`Perfil: ${hasProfile ? displayName : "Configurar perfil"}. Pressione Enter para abrir configurações.`}
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="gold-gradient text-primary-foreground text-sm font-semibold">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {hasProfile ? displayName : "Configurar perfil"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {displayProfessionalType || displayCrp || (hasProfile ? "" : "Adicione nome em Configurações")}
            </p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleLogout(); }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Sair"
            aria-label="Sair da conta"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
