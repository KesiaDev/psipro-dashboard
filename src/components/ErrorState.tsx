import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  status?: number;
}

export function ErrorState({
  title = "Algo deu errado",
  message = "Não foi possível carregar os dados. Tente novamente.",
  onRetry,
  status,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 mb-4">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
      <div className="flex gap-3 mt-6">
        {status === 401 ? (
          <Button variant="gold" className="rounded-xl" asChild>
            <Link to="/login">Fazer login</Link>
          </Button>
        ) : onRetry ? (
          <Button variant="outline-gold" className="rounded-xl" onClick={onRetry}>
            Tentar novamente
          </Button>
        ) : null}
      </div>
    </div>
  );
}
