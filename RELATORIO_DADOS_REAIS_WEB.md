# Relatório de Auditoria — Dados Reais na Web PsiPro Dashboard

**Data:** 1 de março de 2026  
**Objetivo:** Garantir que todos os dados exibidos na aplicação venham exclusivamente da API backend real (NestJS), sem mocks, fallbacks estáticos ou dados hardcoded.

---

## 1. Resumo Executivo

✅ **Confirmação:** A aplicação foi auditada e refatorada. **Todos os mocks foram removidos** e substituídos por chamadas reais à API NestJS.

✅ **Fluxo obrigatório:** Web → Backend (NestJS) → Prisma → PostgreSQL

❌ **Sem Supabase** para dados (removido da camada de dados)  
❌ **Sem dados locais** ou fallback estático  
❌ **Sem dados falsos** (ex.: Ana Souza, Carlos Lima, etc.)

---

## 2. Lista de Arquivos Alterados

| Arquivo | Alteração |
|---------|-----------|
| `src/services/api.ts` | **Único ponto de requisição HTTP** — Cliente axios com baseURL (VITE_API_URL), token, X-Clinic-Id, 401/403 |
| `src/vite-env.d.ts` | Adicionadas tipagens para `VITE_API_URL` e `NEXT_PUBLIC_API_URL` |
| `.env` | Adicionado `VITE_API_URL=http://localhost:3000` |
| `src/contexts/AuthContext.tsx` | Substituído Supabase por autenticação via API NestJS (POST /auth/login) |
| `src/contexts/ClinicContext.tsx` | Substituído `mockClinics` por dados de `useClinics()` → GET /clinics |
| `src/hooks/usePatients.ts` | Substituído Supabase por API: GET /patients, POST /patients |
| `src/hooks/useFinancialRecords.ts` | Substituído Supabase por API: GET /financial/records, POST, PATCH, DELETE |
| `src/hooks/useDashboardStats.ts` | **Novo** — GET /patients/count, /appointments/today, /sessions/stats, /financial/summary |
| `src/hooks/useTodayAppointments.ts` | **Novo** — GET /appointments/today |
| `src/hooks/useRecentPatients.ts` | **Novo** — GET /patients/recent |
| `src/hooks/useMiniCalendarDays.ts` | **Novo** — GET /appointments (para dias com agendamentos) |
| `src/hooks/useCalendarAppointments.ts` | **Novo** — GET /appointments?start=&end= |
| `src/hooks/useSessionsData.ts` | **Novo** — GET /sessions |
| `src/hooks/useReportsData.ts` | **Novo** — GET /reports |
| `src/hooks/useClinics.ts` | **Novo** — GET /clinics |
| `src/hooks/useProfessionals.ts` | **Novo** — GET /clinics/:id/professionals |
| `src/pages/Index.tsx` | Usa hooks da API; loading, erro 401/403 exibidos |
| `src/pages/Patients.tsx` | Usa `usePatients`; GET /patients, POST /patients; AddPatientDialog; erro 401/403 |
| `src/pages/Sessions.tsx` | Usa `useSessionsData`; GET /sessions; erro 401/403 |
| `src/pages/Calendar.tsx` | Usa `useCalendarAppointments`; GET /appointments; erro 401/403 |
| `src/pages/Reports.tsx` | Usa `useReportsData`; GET /reports; erro 401/403 |
| `src/pages/Financials.tsx` | Usa `useFinancialRecords`; GET /financial/records; erro 401/403 |
| `src/pages/Clinics.tsx` | Usa `useClinic` (dados de GET /clinics); erro 401/403 |
| `src/pages/Psychologists.tsx` | Usa `useProfessionals`; GET /clinics/:id/professionals; erro 401/403 |
| `src/components/AppointmentsList.tsx` | Recebe `appointments` por props da API (sem mock) |
| `src/components/RecentPatients.tsx` | Recebe `patients` por props da API (sem mock) |
| `src/components/MiniCalendar.tsx` | Usa `useMiniCalendarDays` → API (sem mock) |
| `src/components/ErrorState.tsx` | Adicionado suporte a status 401 (botão "Fazer login") |
| `src/components/patients/AddPatientDialog.tsx` | **Novo** — Diálogo para criar paciente via POST /patients |

---

## 3. Endpoints Utilizados

| Página / Recurso | Método | Endpoint |
|-----------------|--------|----------|
| **Dashboard** | | |
| Pacientes Ativos | GET | `/patients/count` |
| Consultas Hoje | GET | `/appointments/today` |
| Taxa de Retorno | GET | `/sessions/stats` |
| Resumo Financeiro | GET | `/financial/summary` |
| Consultas de Hoje (lista) | GET | `/appointments/today` |
| Pacientes Recentes | GET | `/patients/recent` |
| Mini Calendário (dias com consultas) | GET | `/appointments?start=&end=` |
| **Pacientes** | | |
| Listagem | GET | `/patients` |
| Criar paciente | POST | `/patients` |
| **Sessões** | GET | `/sessions` |
| **Agenda** | GET | `/appointments?start=&end=` |
| **Financeiro** | | |
| Registros | GET | `/financial/records` |
| Adicionar | POST | `/financial/records` |
| Atualizar | PATCH | `/financial/records/:id` |
| Excluir | DELETE | `/financial/records/:id` |
| **Relatórios** | GET | `/reports` |
| **Clínicas** | GET | `/clinics` |
| **Profissionais** | GET | `/clinics/:id/professionals` |
| **Autenticação** | | |
| Login | POST | `/auth/login` |
| Registro | POST | `/auth/register` |
| Esqueci senha | POST | `/auth/forgot-password` |
| Atualizar senha | POST | `/auth/update-password` |

---

## 4. Confirmação de Remoção Total de Mocks

| Local | Antes | Depois |
|-------|-------|--------|
| `Patients.tsx` | Array `patients` com Ana Souza, Carlos Lima, etc. | Dados de `usePatients()` → GET /patients |
| `Sessions.tsx` | Array `sessions` hardcoded | Dados de `useSessionsData()` → GET /sessions |
| `Calendar.tsx` | Array `events` hardcoded | Dados de `useCalendarAppointments()` → GET /appointments |
| `Reports.tsx` | `monthlyData`, `revenueData`, `typeData`, `topPatients` hardcoded | Dados de `useReportsData()` → GET /reports |
| `AppointmentsList.tsx` | Array `appointments` hardcoded | Props de `useTodayAppointments()` |
| `RecentPatients.tsx` | Array `patients` hardcoded | Props de `useRecentPatients()` |
| `MiniCalendar.tsx` | `appointmentDays` mock | Dados de `useMiniCalendarDays()` → API |
| `ClinicContext.tsx` | `mockClinics` | Dados de `useClinics()` → GET /clinics |
| `Psychologists.tsx` | `mockProfessionals` | Dados de `useProfessionals()` → GET /clinics/:id/professionals |
| `Index.tsx` (Dashboard) | StatCards com valores fixos (48, 5, 92%, 32h) | Valores de `useDashboardStats()` |

---

## 5. Confirmação: Aplicação Depende Exclusivamente da API Real

- ✅ Nenhum dado é exibido se a API falhar (sem fallback silencioso)
- ✅ Sem dados falsos ou exemplos hardcoded
- ✅ Loading exibido durante carregamento
- ✅ Erro 401: mensagem "Sessão expirada" + botão "Fazer login"
- ✅ Erro 403: mensagem "Acesso negado" visível na página
- ✅ Após criar paciente: refetch automático (GET /patients)
- ✅ Variável de ambiente: `VITE_API_URL` (ou `NEXT_PUBLIC_API_URL`) para URL da API

---

## 6. Configuração Necessária

No arquivo `.env`:

```
VITE_API_URL=http://localhost:3000
```

Substitua pela URL real do backend NestJS em produção.

---

## 7. Observações para o Backend NestJS

O frontend espera que os endpoints retornem dados no formato esperado. Exemplos:

- **GET /patients/count** → `{ count: number }`
- **GET /appointments/today** → `{ count?: number, appointments?: [...] }` ou array
- **GET /sessions/stats** → `{ returnRate?: number, percentage?: number }`
- **GET /financial/summary** → `{ totalIncome?, totalExpenses?, netProfit?, pending? }`
- **POST /auth/login** → `{ access_token: string, user?: { id, email, ... } }`

Os hooks foram implementados com flexibilidade para aceitar variações nos nomes dos campos (ex.: `patient_name` ou `patient.name`).
