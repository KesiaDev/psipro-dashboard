import React, { createContext, useContext, useState } from "react";

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

const mockClinics: Clinic[] = [
  {
    id: "1",
    name: "PsiPro Centro",
    address: "Av. Paulista, 1000 - São Paulo, SP",
    phone: "(11) 3000-1000",
    email: "centro@psipro.com.br",
    professionals: 8,
    patients: 120,
    status: "active",
    plan: "Premium",
    createdAt: "2023-01-15",
  },
  {
    id: "2",
    name: "PsiPro Jardins",
    address: "Rua Oscar Freire, 500 - São Paulo, SP",
    phone: "(11) 3000-2000",
    email: "jardins@psipro.com.br",
    professionals: 5,
    patients: 78,
    status: "active",
    plan: "Premium",
    createdAt: "2023-06-10",
  },
  {
    id: "3",
    name: "PsiPro Campinas",
    address: "Av. Norte Sul, 200 - Campinas, SP",
    phone: "(19) 3200-3000",
    email: "campinas@psipro.com.br",
    professionals: 3,
    patients: 42,
    status: "active",
    plan: "Básico",
    createdAt: "2024-02-20",
  },
];

interface ClinicContextType {
  clinics: Clinic[];
  selectedClinic: Clinic;
  setSelectedClinicId: (id: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [selectedClinicId, setSelectedClinicId] = useState(mockClinics[0].id);
  const [userRole, setUserRole] = useState<UserRole>("owner");

  const selectedClinic = mockClinics.find((c) => c.id === selectedClinicId) || mockClinics[0];

  return (
    <ClinicContext.Provider
      value={{ clinics: mockClinics, selectedClinic, setSelectedClinicId, userRole, setUserRole }}
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
