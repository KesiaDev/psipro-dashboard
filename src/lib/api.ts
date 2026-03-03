/**
 * API client para comunicação com o backend NestJS.
 * Usa VITE_API_URL (sem /api no final - ex: https://psipro-backend-production.up.railway.app).
 * Rotas: /reports, /patients, /appointments/today, etc. (sem prefixo /api nas chamadas).
 * Fluxo: Web → Backend (NestJS) → Prisma → PostgreSQL
 */

const CLINIC_ID_KEY = "clinicId";

const getBaseUrl = (): string => {
  const url = (import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL || "").trim();
  if (!url) {
    console.error("VITE_API_URL ou NEXT_PUBLIC_API_URL não configurada no .env");
    return "";
  }
  // Use base URL sem /api no final. Ex: https://psipro-backend-production.up.railway.app
  // Rotas são /reports, /patients, etc. (sem prefixo /api nas chamadas).
  return url.replace(/\/+$/, "");
};

const getAuthToken = (): string | null => {
  return localStorage.getItem("psipro_token");
};

const getClinicId = (): string | null => {
  return localStorage.getItem(CLINIC_ID_KEY);
};

export { CLINIC_ID_KEY };

export interface ApiError {
  status: number;
  message: string;
  data?: unknown;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getBaseUrl();
  if (!baseUrl) {
    throw { status: 0, message: "API URL não configurada" } as ApiError;
  }

  const token = getAuthToken();
  const clinicId = getClinicId();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  if (clinicId) {
    (headers as Record<string, string>)["X-Clinic-Id"] = clinicId;
  }

  const base = baseUrl.replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith("http") ? endpoint : `${base}${path}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("psipro_token");
    localStorage.removeItem("psipro_user");
    localStorage.removeItem(CLINIC_ID_KEY);
    window.dispatchEvent(new CustomEvent("psipro:auth:401"));
    throw { status: 401, message: "Sessão expirada. Faça login novamente.", data: null } as ApiError;
  }

  if (response.status === 403) {
    throw { status: 403, message: "Acesso negado. Você não tem permissão para esta ação.", data: null } as ApiError;
  }

  if (!response.ok) {
    let message = `Erro ${response.status}`;
    try {
      const errData = await response.json();
      message = errData.message || errData.error || message;
    } catch {
      message = (await response.text()) || message;
    }
    throw { status: response.status, message, data: null } as ApiError;
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json() as Promise<T>;
  }
  return response.text() as unknown as T;
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: "GET" }),
  post: <T>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(endpoint: string, body?: unknown) =>
    apiRequest<T>(endpoint, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: "DELETE" }),
};
