import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useClinics } from "@/hooks/useClinics";
import { CLINIC_ID_KEY } from "@/lib/api";

export type UserRole = "owner" | "admin" | "psychologist";

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  professionals: number;
  patients: number;
  status: "active" | "inactive";
  plan: string;
  createdAt: string;
}

export interface Professional {
  id: string;
  name: string;
  crp: string;
  specialty: string;
  email: string;
  phone: string;
  avatar: string;
  status: "active" | "inactive" | "vacation";
  patientsCount: number;
  sessionsThisMonth: number;
  clinicId: string;
}

interface ClinicContextType {
  clinics: Clinic[];
  selectedClinic: Clinic;
  setSelectedClinicId: (id: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  loading: boolean;
  error: { status?: number; message?: string } | null;
  refetch: () => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const { clinics, loading, error, refetch } = useClinics();
  const [selectedClinicId, setSelectedClinicIdState] = useState<string>("");
  const [userRole, setUserRole] = useState<UserRole>("owner");

  const setSelectedClinicId = useCallback((id: string) => {
    setSelectedClinicIdState(id);
    localStorage.setItem(CLINIC_ID_KEY, id);
  }, []);

  useEffect(() => {
    if (clinics.length > 0 && !selectedClinicId) {
      const stored = localStorage.getItem(CLINIC_ID_KEY);
      const id = stored && clinics.some((c) => c.id === stored) ? stored : clinics[0].id;
      setSelectedClinicIdState(id);
      localStorage.setItem(CLINIC_ID_KEY, id);
    }
  }, [clinics, selectedClinicId]);

  const selectedClinic =
    clinics.find((c) => c.id === selectedClinicId) || clinics[0] || ({
      id: "",
      name: "—",
      address: "",
      phone: "",
      email: "",
      professionals: 0,
      patients: 0,
      status: "active" as const,
      plan: "",
      createdAt: "",
    });

  return (
    <ClinicContext.Provider
      value={{ clinics, selectedClinic, setSelectedClinicId, userRole, setUserRole, loading, error, refetch }}
    >
      {children}
    </ClinicContext.Provider>
  );
}

export function useClinic() {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error("useClinic must be used within ClinicProvider");
  return ctx;
}
