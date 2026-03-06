import { useClinic } from "@/contexts/ClinicContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

/**
 * Evita que páginas que precisam de clinicId montem antes do clinic estar pronto,
 * eliminando requisições sem o header x-clinic-id.
 */
export function ClinicGate({ children }: { children: React.ReactNode }) {
  const { isClinicReady } = useClinic();

  if (!isClinicReady) {
    return (
      <DashboardLayout title="Carregando...">
        <LoadingSkeleton variant="page" />
      </DashboardLayout>
    );
  }

  return <>{children}</>;
}
