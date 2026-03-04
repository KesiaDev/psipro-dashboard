/**
 * Ponto central ÚNICO para todas as requisições HTTP do frontend.
 * baseURL: import.meta.env.VITE_API_URL (sem concatenação manual).
 * Rotas sempre relativas: /auth/login, /clinics, /patients, /reports, etc.
 * Fluxo: Web → Backend (NestJS) → Prisma → PostgreSQL
 */

import axios, { AxiosError } from "axios";

const CLINIC_ID_KEY = "clinicId";
const TOKEN_KEY = "psipro_token";
const USER_KEY = "psipro_user";

export { CLINIC_ID_KEY };

export interface ApiError {
  status: number;
  message: string;
  data?: unknown;
}

const baseURL = (import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL || "").trim();

if (!baseURL) {
  console.error("VITE_API_URL ou NEXT_PUBLIC_API_URL não configurada no .env");
}

const axiosInstance = axios.create({
  baseURL: baseURL || undefined,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const clinicId = localStorage.getItem(CLINIC_ID_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (clinicId) {
    config.headers["X-Clinic-Id"] = clinicId;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status ?? 0;
    const data = error.response?.data as { message?: string; error?: string } | undefined;

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(CLINIC_ID_KEY);
      window.dispatchEvent(new CustomEvent("psipro:auth:401"));
    }

    const apiError: ApiError = {
      status,
      message: data?.message ?? data?.error ?? error.message ?? `Erro ${status}`,
      data: error.response?.data,
    };

    return Promise.reject(apiError);
  }
);

export const api = {
  get: <T>(url: string) =>
    axiosInstance.get<T>(url).then((res) => res.data),

  post: <T>(url: string, body?: unknown) =>
    axiosInstance.post<T>(url, body).then((res) => res.data),

  postForm: <T>(url: string, formData: FormData, onProgress?: (percent: number) => void) =>
    axiosInstance
      .post<T>(url, formData, {
        headers: { "Content-Type": undefined },
        ...(onProgress && {
          onUploadProgress: (e) => {
            if (e.total && e.total > 0) {
              onProgress(Math.round((e.loaded / e.total) * 100));
            }
          },
        }),
      })
      .then((res) => res.data),

  put: <T>(url: string, body?: unknown) =>
    axiosInstance.put<T>(url, body).then((res) => res.data),

  patch: <T>(url: string, body?: unknown) =>
    axiosInstance.patch<T>(url, body).then((res) => res.data),

  delete: <T>(url: string) =>
    axiosInstance.delete<T>(url).then((res) => res.data),
};
