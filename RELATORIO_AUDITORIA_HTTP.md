# Relatório de Auditoria HTTP — Ponto Único de Requisição

## ✅ Confirmação: Um Único Ponto Central

Todas as chamadas HTTP do frontend passam **exclusivamente** pelo objeto `api` em `src/services/api.ts`.

---

## Arquivos Modificados

| Arquivo | Alteração |
|---------|-----------|
| `src/services/api.ts` | **Novo** — conteúdo migrado de `lib/api.ts` |
| `src/lib/api.ts` | **Removido** — consolidado em `services/api.ts` |
| `src/contexts/AuthContext.tsx` | Import: `@/lib/api` → `@/services/api` |
| `src/contexts/ClinicContext.tsx` | Import: `@/lib/api` → `@/services/api` |
| `src/hooks/useDashboardStats.ts` | Import: `@/lib/api` → `@/services/api` |
| `src/hooks/useTodayAppointments.ts` | Import: `@/lib/api` → `@/services/api` |
| `src/hooks/useRecentPatients.ts` | Import: `@/lib/api` → `@/services/api` |
| `src/hooks/useCalendarAppointments.ts` | Import: `@/lib/api` → `@/services/api` |
| `src/hooks/useMiniCalendarDays.ts` | Import: `@/lib/api` → `@/services/api` |
| `src/hooks/useSessionsData.ts` | Import: `@/lib/api` → `@/services/api` |
| `src/hooks/useReportsData.ts` | Import: `@/lib/api` → `@/services/api` |
| `src/hooks/useClinics.ts` | Import: `@/lib/api` → `@/services/api` |
| `src/hooks/useProfessionals.ts` | Import: `@/lib/api` → `@/services/api` |
| `src/hooks/usePatients.ts` | Import: `@/lib/api` → `@/services/api` |
| `src/hooks/useFinancialRecords.ts` | Import: `@/lib/api` → `@/services/api` |
| `src/components/AppointmentsList.tsx` | Import: `@/lib/api` → `@/services/api` |
| `src/components/RecentPatients.tsx` | Import: `@/lib/api` → `@/services/api` |
| `RELATORIO_DADOS_REAIS_WEB.md` | Atualizada referência para `services/api.ts` |

---

## Antes e Depois

### Antes
- `src/lib/api.ts` — cliente HTTP
- Imports espalhados: `from "@/lib/api"`
- Um único axios instance (já estava correto)

### Depois
- `src/services/api.ts` — **único** cliente HTTP
- Imports centralizados: `from "@/services/api"`
- Um único axios instance
- `src/lib/api.ts` removido

---

## Verificações Realizadas

| Item | Status |
|------|--------|
| Uso de `fetch(` direto | ❌ Nenhum encontrado |
| Uso de `axios.get/post` direto | ❌ Nenhum (apenas via `api`) |
| Chamadas usando `api` de `@/services/api` | ✅ Todas |
| baseURL = `import.meta.env.VITE_API_URL` | ✅ Sim |
| Concatenação manual de URL | ❌ Não existe |
| AuthContext: `api.post('/auth/login', payload)` | ✅ Sim |
| `window.location.origin` em chamadas | ❌ Nenhum |
| URL hardcoded para backend | ❌ Nenhum |
| Múltiplas instâncias axios | ❌ Apenas uma em `services/api.ts` |

---

## Estrutura do `services/api.ts`

```typescript
// baseURL — sem concatenação manual
const baseURL = (import.meta.env.VITE_API_URL || ...).trim();
const axiosInstance = axios.create({ baseURL, ... });

// Interceptors: Authorization, X-Clinic-Id, 401/403
export const api = { get, post, put, patch, delete };
```

---

## Rotas Utilizadas (todas relativas)

- `/auth/login` — AuthContext
- `/auth/register` — AuthContext
- `/auth/forgot-password` — AuthContext
- `/auth/update-password` — AuthContext
- `/clinics` — useClinics
- `/clinics/:id/professionals` — useProfessionals
- `/patients` — usePatients
- `/patients/count` — useDashboardStats
- `/patients/recent` — useRecentPatients
- `/appointments/today` — useTodayAppointments, useDashboardStats
- `/appointments` — useCalendarAppointments, useMiniCalendarDays
- `/sessions` — useSessionsData
- `/sessions/stats` — useDashboardStats
- `/financial/summary` — useDashboardStats
- `/financial/records` — useFinancialRecords
- `/reports` — useReportsData
