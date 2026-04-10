/**
 * Ponto central ÚNICO para todas as requisições HTTP do frontend.
 * baseURL: import.meta.env.VITE_API_URL (sem concatenação manual).
 * Rotas sempre relativas: /auth/login, /clinics, /patients, /reports, etc.
 * Fluxo: Web → Backend (NestJS) → Prisma → PostgreSQL
 */

import axios, { AxiosError } from "axios";

const CLINIC_ID_KEY = "clinicId";
const WORKSPACE_CHOSEN_KEY = "psipro_workspace_chosen";
const TOKEN_KEY = "psipro_token";
const USER_KEY = "psipro_user";
const REQUEST_TIMEOUT_MS = 15_000;
const GET_CACHE_TTL_MS = 10_000;
const GET_RETRY_DELAY_MS = 250;

export { CLINIC_ID_KEY, WORKSPACE_CHOSEN_KEY };

export interface ApiError {
  status: number;
  message: string;
  data?: unknown;
}

const baseURL = (import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL || "").trim();

if (!baseURL && import.meta.env.DEV) {
  console.warn("VITE_API_URL não configurada no .env");
}

const axiosInstance = axios.create({
  baseURL: baseURL || undefined,
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

const inFlightGetRequests = new Map<string, Promise<unknown>>();
const getResponseCache = new Map<string, { expiresAt: number; data: unknown }>();

function getCacheKey(url: string): string {
  const clinicId = localStorage.getItem(CLINIC_ID_KEY)?.trim() || "";
  return `${clinicId}::${url}`;
}

function shouldRetryGet(error: unknown): boolean {
  const axiosError = error as AxiosError;
  const status = axiosError.response?.status ?? 0;
  const code = (axiosError as AxiosError & { code?: string }).code ?? "";
  return status >= 500 || status === 0 || code === "ECONNABORTED";
}

async function getWithRetry<T>(url: string): Promise<T> {
  try {
    const res = await axiosInstance.get<T>(url);
    return res.data;
  } catch (error) {
    if (!shouldRetryGet(error)) throw error;
    await new Promise((resolve) => setTimeout(resolve, GET_RETRY_DELAY_MS));
    const retryRes = await axiosInstance.get<T>(url);
    return retryRes.data;
  }
}

function clearApiGetCache() {
  inFlightGetRequests.clear();
  getResponseCache.clear();
}

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const clinicId = localStorage.getItem(CLINIC_ID_KEY)?.trim() || "";

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Só envia X-Clinic-Id quando há valor: string vazia quebra validação (ex.: IsUUID) e retorna 400.
  if (clinicId) {
    config.headers["X-Clinic-Id"] = clinicId;
  } else {
    delete config.headers["X-Clinic-Id"];
  }
  if (!clinicId && !config.url?.startsWith("/auth/") && import.meta.env.DEV) {
    console.warn("[api] Requisição sem clinicId:", config.url);
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
    const data = error.response?.data as { message?: string | string[]; error?: string } | undefined;

    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(CLINIC_ID_KEY);
      localStorage.removeItem(WORKSPACE_CHOSEN_KEY);
      sessionStorage.removeItem(WORKSPACE_CHOSEN_KEY);
      window.dispatchEvent(new CustomEvent("psipro:auth:401"));
    }

    const rawMsg = data?.message ?? data?.error ?? error.message ?? `Erro ${status}`;
    const message = Array.isArray(rawMsg) ? rawMsg.join(". ") : String(rawMsg ?? "");

    const apiError: ApiError = {
      status,
      message,
      data: error.response?.data,
    };

    return Promise.reject(apiError);
  }
);

export const api = {
  get: <T>(url: string) => {
    const cacheKey = getCacheKey(url);
    const now = Date.now();
    const cached = getResponseCache.get(cacheKey);

    if (cached && cached.expiresAt > now) {
      return Promise.resolve(cached.data as T);
    }

    const inFlight = inFlightGetRequests.get(cacheKey);
    if (inFlight) {
      return inFlight as Promise<T>;
    }

    const request = getWithRetry<T>(url)
      .then((data) => {
        getResponseCache.set(cacheKey, {
          expiresAt: Date.now() + GET_CACHE_TTL_MS,
          data,
        });
        return data;
      })
      .finally(() => {
        inFlightGetRequests.delete(cacheKey);
      });

    inFlightGetRequests.set(cacheKey, request as Promise<unknown>);
    return request;
  },

  post: <T>(url: string, body?: unknown) =>
    axiosInstance.post<T>(url, body).then((res) => {
      clearApiGetCache();
      return res.data;
    }),

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
      .then((res) => {
        clearApiGetCache();
        return res.data;
      }),

  put: <T>(url: string, body?: unknown) =>
    axiosInstance.put<T>(url, body).then((res) => {
      clearApiGetCache();
      return res.data;
    }),

  patch: <T>(url: string, body?: unknown) =>
    axiosInstance.patch<T>(url, body).then((res) => {
      clearApiGetCache();
      return res.data;
    }),

  delete: <T>(url: string) =>
    axiosInstance.delete<T>(url).then((res) => {
      clearApiGetCache();
      return res.data;
    }),
};
