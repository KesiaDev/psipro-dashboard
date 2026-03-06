import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Search } from "lucide-react";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import { Button } from "@/components/ui/button";
import { ClinicSelector } from "@/components/ClinicSelector";
import { VoiceCommandButton } from "@/components/VoiceCommandButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { WorkspaceSelectionModal } from "@/components/WorkspaceSelectionModal";
import { CreateFirstClinicModal } from "@/components/CreateFirstClinicModal";
import { useClinic } from "@/contexts/ClinicContext";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DashboardLayout({ children, title = "Dashboard" }: DashboardLayoutProps) {
  const { needsWorkspaceSelection, needsFirstClinic, isClinicReady } = useClinic();

  return (
    <SidebarProvider>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-xl"
      >
        Pular para o conteúdo principal
      </a>
      <div className="flex min-h-screen w-full bg-background" role="application" aria-label="PsiPro Dashboard">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-6" role="banner">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" aria-label="Abrir menu lateral" />
              <h2 className="font-heading text-lg font-semibold text-foreground">{title}</h2>
            </div>
            <div className="flex items-center gap-2">
              <VoiceCommandButton />
              <ClinicSelector />
              <ThemeToggle />
              <Button variant="ghost" size="icon" className="rounded-xl text-muted-foreground hover:text-foreground" aria-label="Buscar">
                <Search className="h-[18px] w-[18px]" aria-hidden="true" />
              </Button>
              <NotificationsDropdown />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6" role="main" id="main-content">
            {isClinicReady ? children : <LoadingSkeleton variant="page" />}
          </main>
        </div>
      </div>
      {needsFirstClinic && <CreateFirstClinicModal />}
      {needsWorkspaceSelection && <WorkspaceSelectionModal />}
    </SidebarProvider>
  );
}
