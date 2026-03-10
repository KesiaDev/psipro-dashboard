import { useClinic } from "@/contexts/ClinicContext";
import { Navigate } from "react-router-dom";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { userRole } = useClinic();

  if (userRole !== "admin" && userRole !== "owner") {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
