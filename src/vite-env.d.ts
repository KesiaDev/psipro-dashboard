/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly NEXT_PUBLIC_API_URL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  readonly VITE_DEVELOPER_EMAILS?: string;
  /** URL base do Evolution (opcional; pré-preenche o modal WhatsApp em Integrações) */
  readonly VITE_EVOLUTION_API_URL?: string;
}
