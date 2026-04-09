import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, ApiError, CLINIC_ID_KEY, WORKSPACE_CHOSEN_KEY } from "@/services/api";

export interface AuthUser {
  id: string;
  email?: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: AuthUser | null;
  session: { access_token: string } | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata: { first_name: string; last_name: string; crp: string; professionalType?: string }) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithHandoff: (token: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
}

const AUTH_KEY = "psipro_user";
const TOKEN_KEY = "psipro_token";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(AUTH_KEY);
      if (token && storedUser) {
        try {
          const u = JSON.parse(storedUser) as AuthUser;
          setUser(u);
          setSession({ access_token: token });
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(AUTH_KEY);
        }
      } else {
        setUser(null);
        setSession(null);
      }
    };
    initAuth();
    setLoading(false);

    const handle401 = () => {
      setUser(null);
      setSession(null);
    };
    window.addEventListener("psipro:auth:401", handle401);
    return () => window.removeEventListener("psipro:auth:401", handle401);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const payload = { email, password };
      const res = await api.post<{ access_token: string; user?: AuthUser; clinics?: { id: string }[] }>("/auth/login", payload);
      const token = res.access_token ?? (res as { access_token?: string }).access_token;
      const userData = res.user ?? (res as { user?: AuthUser }).user ?? { id: email, email };
      const clinics = res.clinics ?? (res as { clinics?: { id: string }[] }).clinics;
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(AUTH_KEY, JSON.stringify({ id: userData?.id ?? email, email: userData?.email ?? email, ...userData }));
        setUser({ id: String(userData?.id ?? email), email: userData?.email ?? email, ...userData } as AuthUser);
        setSession({ access_token: token });
        localStorage.removeItem(CLINIC_ID_KEY);
        localStorage.removeItem(WORKSPACE_CHOSEN_KEY);
        sessionStorage.removeItem(WORKSPACE_CHOSEN_KEY);
        return { error: null };
      }
      return { error: new Error("Resposta inválida do servidor") };
    } catch (err) {
      const e = err as ApiError;
      return { error: new Error(e.message ?? "Erro ao entrar") };
    }
  };

  const signInWithHandoff = async (handoffToken: string) => {
    try {
      const res = await api.post<{ token?: string; access_token?: string; accessToken?: string; user?: { id?: string; email?: string; name?: string; full_name?: string; clinicId?: string } }>("/auth/handoff", { token: handoffToken });
      const token = res.token ?? res.access_token ?? res.accessToken ?? (res as { token?: string }).token;
      const userData = res.user ?? (res as { user?: AuthUser }).user;
      if (token && userData) {
        localStorage.setItem(TOKEN_KEY, token);
        const userToSave: AuthUser = {
          id: String(userData.id ?? userData.email ?? ""),
          email: userData.email,
          full_name: userData.name ?? userData.full_name,
          ...userData,
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(userToSave));
        if (userData.clinicId) {
          localStorage.setItem(CLINIC_ID_KEY, userData.clinicId);
          localStorage.setItem(WORKSPACE_CHOSEN_KEY, JSON.stringify({ clinicId: userData.clinicId, role: "owner" }));
        }
        setUser(userToSave);
        setSession({ access_token: token });
        return { error: null };
      }
      return { error: new Error("Resposta inválida do handoff") };
    } catch (err) {
      const e = err as ApiError;
      return { error: new Error(e.message ?? "Erro ao validar token do app") };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata: { first_name: string; last_name: string; crp: string; professionalType?: string }
  ) => {
    try {
      await api.post("/auth/register", {
        email,
        password,
        firstName: metadata.first_name,
        lastName: metadata.last_name,
        crp: metadata.crp,
        professionalType: metadata.professionalType ?? "Psicólogo",
      });
      return { error: null };
    } catch (err) {
      const e = err as ApiError;
      return { error: new Error(e.message ?? "Erro ao criar conta") };
    }
  };

  const signOut = async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(CLINIC_ID_KEY);
    localStorage.removeItem(WORKSPACE_CHOSEN_KEY);
    sessionStorage.removeItem(WORKSPACE_CHOSEN_KEY);
    setUser(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    try {
      await api.post("/auth/forgot-password", { email });
      return { error: null };
    } catch (err) {
      const e = err as ApiError;
      return { error: new Error(e.message ?? "Erro ao enviar email") };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      await api.post("/auth/update-password", { password });
      return { error: null };
    } catch (err) {
      const e = err as ApiError;
      return { error: new Error(e.message ?? "Erro ao atualizar senha") };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signUp,
        signIn,
        signInWithHandoff,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
