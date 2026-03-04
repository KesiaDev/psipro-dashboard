import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useClinics, type CreateClinicInput } from "@/hooks/useClinics";
import { CLINIC_ID_KEY, WORKSPACE_CHOSEN_KEY } from "@/services/api";

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
  createClinic: (input: CreateClinicInput) => Promise<Clinic | null>;
  updateClinic: (id: string, input: Partial<CreateClinicInput>) => Promise<boolean>;
  updateClinicStatus: (id: string, status: "active" | "inactive") => Promise<boolean>;
  needsWorkspaceSelection: boolean;
  needsFirstClinic: boolean;
  confirmWorkspaceSelection: () => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const { clinics, loading, error, refetch, createClinic, updateClinic, updateClinicStatus } = useClinics();
  const [selectedClinicId, setSelectedClinicIdState] = useState<string>("");
  const [userRole, setUserRole] = useState<UserRole>("owner");
  const [workspaceConfirmed, setWorkspaceConfirmed] = useState(false);

  const setSelectedClinicId = useCallback((id: string) => {
    setSelectedClinicIdState(id);
    if (sessionStorage.getItem(WORKSPACE_CHOSEN_KEY)) {
      localStorage.setItem(CLINIC_ID_KEY, id);
    }
  }, []);

  const hasChosenWorkspace = !!sessionStorage.getItem(WORKSPACE_CHOSEN_KEY) || workspaceConfirmed;
  const needsWorkspaceSelection = clinics.length > 1 && !hasChosenWorkspace;
  const needsFirstClinic = clinics.length === 0 && !loading && !error;

  const confirmWorkspaceSelection = useCallback(() => {
    if (selectedClinicId) {
      localStorage.setItem(CLINIC_ID_KEY, selectedClinicId);
      sessionStorage.setItem(WORKSPACE_CHOSEN_KEY, JSON.stringify({ clinicId: selectedClinicId, role: userRole }));
      setWorkspaceConfirmed(true);
    }
  }, [selectedClinicId, userRole]);

  useEffect(() => {
    if (clinics.length === 0) return;
    const ws = sessionStorage.getItem(WORKSPACE_CHOSEN_KEY);
    if (ws) {
      try {
        const { clinicId, role } = JSON.parse(ws) as { clinicId?: string; role?: UserRole };
        if (clinicId && clinics.some((c) => c.id === clinicId)) {
          setSelectedClinicIdState(clinicId);
          localStorage.setItem(CLINIC_ID_KEY, clinicId);
          if (role && ["owner", "admin", "psychologist"].includes(role)) setUserRole(role);
        }
      } catch {
        sessionStorage.removeItem(WORKSPACE_CHOSEN_KEY);
      }
    } else if (!selectedClinicId) {
      setSelectedClinicIdState(clinics[0].id);
      if (clinics.length === 1) {
        localStorage.setItem(CLINIC_ID_KEY, clinics[0].id);
        sessionStorage.setItem(WORKSPACE_CHOSEN_KEY, JSON.stringify({ clinicId: clinics[0].id, role: "owner" }));
        setWorkspaceConfirmed(true);
      }
    }
  }, [clinics]);

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
      value={{ clinics, selectedClinic, setSelectedClinicId, userRole, setUserRole, loading, error, refetch, createClinic, updateClinic, updateClinicStatus, needsWorkspaceSelection, needsFirstClinic, confirmWorkspaceSelection }}
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
