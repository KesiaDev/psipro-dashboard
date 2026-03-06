import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";

export function NotificationsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl text-muted-foreground hover:text-foreground"
          aria-label="Ver notificações"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-2xl p-0" sideOffset={8}>
        <div className="p-4 border-b border-border">
          <h3 className="font-heading text-sm font-semibold text-foreground">Notificações</h3>
        </div>
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhuma notificação nova
          </p>
          <Link
            to="/settings"
            className="mt-3 inline-block text-xs font-medium text-primary hover:underline"
          >
            Configurar preferências
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
