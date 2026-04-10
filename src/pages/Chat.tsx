import { DashboardLayout } from "@/components/DashboardLayout";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const CHAT_URL =
  import.meta.env.VITE_PSIPRO_CHAT_URL ||
  "https://psipro-chat-production.up.railway.app";

export default function Chat() {
  return (
    <DashboardLayout title="Chat WhatsApp">
      <div className="flex flex-col h-[calc(100vh-4rem)] gap-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs text-muted-foreground">
            Chat integrado com Evolution API — gerencie conversas dos seus pacientes
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-xs"
            onClick={() => window.open(CHAT_URL, "_blank")}
          >
            <ExternalLink className="h-3 w-3" />
            Abrir em nova aba
          </Button>
        </div>
        <iframe
          src={CHAT_URL}
          title="PsiPro Chat WhatsApp"
          className="flex-1 w-full rounded-xl border border-border bg-background"
          allow="microphone; camera"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </DashboardLayout>
  );
}
