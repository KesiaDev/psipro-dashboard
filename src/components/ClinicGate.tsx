import { useClinic } from "@/contexts/ClinicContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { ErrorState } from "@/components/ErrorState";

/**
 * Evita que páginas que precisam de clinicId montem antes do clinic estar pronto,
 * eliminando requisições sem o header x-clinic-id.
 */
export function ClinicGate({ children }: { children: React.ReactNode }) {
  const { isClinicReady, loading, error, refetch, clinicId } = useClinic();

  // Erro ao carregar clínicas e sem clinicId = tela presa. Mostra erro com retry.
  if (!loading && error && !clinicId) {
    return (
      <DashboardLayout title="Erro">
        <ErrorState
          title={error.status === 401 ? "Sessão expirada" : "Erro ao carregar clínicas"}
          message={error.message ?? "Não foi possível carregar suas clínicas. Verifique a conexão e tente novamente."}
          status={error.status}
          onRetry={refetch}
        />
      </DashboardLayout>
    );
  }

  if (!isClinicReady) {
    return (
      <DashboardLayout title="Carregando...">
        <LoadingSkeleton variant="page" />
      </DashboardLayout>
    );
  }

  return <>{children}</>;
}
