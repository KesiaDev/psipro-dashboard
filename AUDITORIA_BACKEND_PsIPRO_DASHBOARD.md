# Auditoria Técnica — PsiPro Dashboard

**Objetivo:** Garantir que todas as funcionalidades do sistema estejam realmente conectadas ao backend e não apenas simuladas.

**Data:** Março 2025

---

## 1. ROTAS E TELAS

| Rota | Página | Componente Principal |
|------|--------|---------------------|
| `/` | Dashboard | Index |
| `/clinics` | Clínicas | Clinics |
| `/psychologists` | Profissionais | Psychologists |
| `/patients` | Pacientes | Patients |
| `/patients/:id` | Detalhe do Paciente | PatientDetail |
| `/calendar` | Agenda | Calendar |
| `/sessions` | Sessões | Sessions |
| `/financials` | Financeiro | Financials |
| `/reports` | Relatórios | Reports |
| `/settings` | Configurações | Settings |
| `/login` | Login | Login |
| `/register` | Cadastro | Register |
| `/forgot-password` | Esqueci a senha | ForgotPassword |
| `/reset-password` | Redefinir senha | ResetPassword |

---

## 2. ANÁLISE DETALHADA POR TELA

### 2.1 Dashboard (`/`)

| Item | Detalhes |
|------|----------|
| **Componentes** | DashboardLayout, StatCard, AppointmentsList, MiniCalendar, RecentPatients, ErrorState, LoadingSkeleton |
| **APIs chamadas** | `GET /patients/count`, `GET /appointments/today`, `GET /sessions/stats`, `GET /financial/summary` (via useDashboardStats); `GET /appointments/today` (useTodayAppointments); `GET /patients/recent` (useRecentPatients) |
| **Dados do backend** | Pacientes ativos, consultas hoje, taxa de retorno, horas atendidas, lista de consultas, mini-calendário com dias, pacientes recentes |
| **Dados mockados** | Sim — `change={stats ? "+3 este mês" : undefined}` no StatCard "Pacientes Ativos" — valor fixo, não vem da API |
| **Status** | ⚠️ Parcialmente integrado. Dados principais da API; label secundário hardcoded |

---

### 2.2 Clínicas (`/clinics`)

| Item | Detalhes |
|------|----------|
| **Componentes** | DashboardLayout, PageContainer, Card, Button, Badge, DropdownMenu |
| **APIs chamadas** | `GET /clinics` (via ClinicContext → useClinics) |
| **Dados do backend** | Lista de clínicas, professionals, patients, status, plan |
| **Dados mockados** | Não |
| **Botões** | |
| | • **Nova Clínica** — sem `onClick` |
| | • **Editar** (dropdown) — sem `onClick` |
| | • **Ver profissionais** — sem `onClick` |
| | • **Financeiro** — sem `onClick` |
| | • **Desativar** — sem `onClick` |
| **Status** | ❌ Somente leitura. Nenhuma ação de criação/edição integrada |

---

### 2.3 Profissionais (`/psychologists`)

| Item | Detalhes |
|------|----------|
| **Componentes** | DashboardLayout, PageContainer, Card, Button, Badge, Avatar, Input, DropdownMenu |
| **APIs chamadas** | `GET /clinics/:id/professionals` ou `GET /professionals` (via useProfessionals + ClinicContext) |
| **Dados do backend** | Lista de profissionais por clínica (clinic_id vinculado) |
| **Dados mockados** | Não |
| **Botões** | |
| | • **Adicionar Profissional** — sem `onClick` |
| | • **Ver Perfil** — sem `onClick` |
| | • **Editar** — sem `onClick` |
| | • **Ver Agenda** — sem `onClick` |
| | • **Remover** — sem `onClick` |
| **Status** | ❌ Somente leitura. Nenhuma ação de CRUD integrada |

---

### 2.4 Pacientes (`/patients`)

| Item | Detalhes |
|------|----------|
| **Componentes** | DashboardLayout, Avatar, Badge, Button, Input, DropdownMenu, AlertDialog, AddPatientDialog, EditPatientModal, ImportPatientsModal |
| **APIs chamadas** | `GET /patients`, `POST /patients`, `PUT /patients/:id`, `DELETE /patients/:id`, `POST /patients/import` |
| **Dados do backend** | Lista de pacientes, criação, edição, exclusão, importação Excel |
| **Dados mockados** | Não |
| **Botões** | |
| | • **Novo Paciente** → AddPatientDialog → `POST /patients` ✅ |
| | • **Importar Excel** → ImportPatientsModal → `POST /patients/import` ✅ |
| | • **Ver paciente** → `navigate(/patients/:id)` ✅ |
| | • **Editar paciente** → EditPatientModal → `PUT /patients/:id` ✅ |
| | • **Ver sessões** → `navigate(/sessions?patientId=...)` ✅ |
| | • **Excluir paciente** → AlertDialog + `DELETE /patients/:id` ✅ |
| **Status** | ✅ Totalmente integrado |

---

### 2.5 Detalhe do Paciente (`/patients/:id`)

| Item | Detalhes |
|------|----------|
| **Componentes** | DashboardLayout, Avatar, Badge, Button, ErrorState, LoadingSkeleton |
| **APIs chamadas** | `GET /patients/:id` |
| **Dados do backend** | Dados do paciente, sessões (se o backend retornar) |
| **Dados mockados** | Não |
| **Status** | ✅ Integrado ao backend |

---

### 2.6 Agenda (`/calendar`)

| Item | Detalhes |
|------|----------|
| **Componentes** | DashboardLayout, Avatar, Badge, Button, ErrorState, LoadingSkeleton |
| **APIs chamadas** | `GET /appointments?start=&end=` (useCalendarAppointments) |
| **Dados do backend** | Agendamentos da semana (start/end passados; mas o fetch usa datas fixas na primeira carga) |
| **Dados mockados** | `HOURS`, `WEEK_DAYS` — constantes de UI (não são dados de negócio) |
| **Botões** | |
| | • **ChevronLeft** (semana anterior) — sem `onClick` |
| | • **Hoje** — sem `onClick` |
| | • **ChevronRight** (próxima semana) — sem `onClick` |
| | • **Novo Agendamento** — sem `onClick` |
| **Problema** | `useCalendarAppointments` aceita `startDate`/`endDate` em `refetch`, mas a Calendar não passa `weekStart` ao refetch. Navegações de semana não atualizam os dados. |
| **Status** | ⚠️ Leitura integrada; criação e navegação de semana não funcionam |

---

### 2.7 Sessões (`/sessions`)

| Item | Detalhes |
|------|----------|
| **Componentes** | DashboardLayout, Avatar, Badge, Button, Input |
| **APIs chamadas** | `GET /sessions` |
| **Dados do backend** | Lista de sessões |
| **Dados mockados** | Não |
| **Botões** | |
| | • **Nova Sessão** — sem `onClick` |
| | • Filtros (search, status) — funcionais ✅ |
| **Status** | ⚠️ Somente leitura. Sem criação de sessão |

---

### 2.8 Financeiro (`/financials`)

| Item | Detalhes |
|------|----------|
| **Componentes** | DashboardLayout, PageContainer, Card, Badge, Button, AddFinancialRecordDialog |
| **APIs chamadas** | `GET /financial/records`, `POST /financial/records`, `PATCH /financial/records/:id`, `DELETE /financial/records/:id` |
| **Dados do backend** | Registros financeiros, criar, editar (marcar pago), excluir |
| **Dados mockados** | Não |
| **Botões** | |
| | • **Novo Registro** → AddFinancialRecordDialog → `POST /financial/records` ✅ |
| | • Marcar como pago → `PATCH /financial/records/:id` ✅ |
| | • Excluir → `DELETE /financial/records/:id` ✅ |
| **Status** | ✅ Totalmente integrado |
| **Observação** | `console.log` de debug em `useFinancialRecords.ts` (linha 81) |

---

### 2.9 Relatórios (`/reports`)

| Item | Detalhes |
|------|----------|
| **Componentes** | DashboardLayout, StatCard, Button, Recharts (BarChart, LineChart, PieChart) |
| **APIs chamadas** | `GET /reports` |
| **Dados do backend** | monthlySessions, revenueData, typeData, topPatients, stats |
| **Dados mockados** | Fallback quando API retorna vazio: `stats = { totalSessions: 0, activePatients: 0, ... }` — é fallback, não mock |
| **Botões** | |
| | • **Exportar PDF** — sem `onClick` |
| **Status** | ⚠️ Leitura integrada; exportação PDF não implementada |

---

### 2.10 Configurações (`/settings`)

| Item | Detalhes |
|------|----------|
| **Componentes** | DashboardLayout, PageContainer, Avatar, Button, Input, Label, Switch, Separator, Tabs |
| **APIs chamadas** | Nenhuma |
| **Dados do backend** | Nenhum |
| **Dados mockados** | Sim — toda a página: |
| | • Perfil: "Dra. Maria Costa", CRP, email, telefone, especialidades |
| | • Horários: "08:00–18:00", 50 min/sessão |
| | • Integrações: PsiPro App (conectado), Google Calendar, WhatsApp, Gateway de Pagamento |
| **Botões** | |
| | • Salvar Alterações (perfil) — sem API |
| | • Salvar Horários — sem API |
| | • Salvar (notificações) — só state local |
| | • Atualizar Senha — sem API |
| | • Ativar 2FA — sem `onClick` |
| | • Conectar/Gerenciar integrações — sem `onClick` |
| **Status** | ❌ Tela totalmente mockada, sem integração com backend |

---

### 2.11 Autenticação (Login, Register, ForgotPassword, ResetPassword)

| Tela | API | Status |
|------|-----|--------|
| Login | `POST /auth/login` | ✅ Integrado |
| Register | `POST /auth/register` | ✅ Integrado |
| ForgotPassword | `POST /auth/forgot-password` | ✅ Integrado |
| ResetPassword | `POST /auth/update-password` | ✅ Integrado |

---

## 3. BOTÕES E AÇÕES — RESUMO

| Botão / Ação | Tela | Conectado | Endpoint | Método |
|--------------|------|-----------|----------|--------|
| Novo Paciente | Pacientes | ✅ | `/patients` | POST |
| Importar Excel | Pacientes | ✅ | `/patients/import` | POST |
| Editar paciente | Pacientes | ✅ | `/patients/:id` | PUT |
| Excluir paciente | Pacientes | ✅ | `/patients/:id` | DELETE |
| Ver paciente | Pacientes | ✅ | Navegação | — |
| Ver sessões | Pacientes | ✅ | Navegação | — |
| Nova Clínica | Clínicas | ❌ | — | — |
| Editar clínica | Clínicas | ❌ | — | — |
| Ver profissionais | Clínicas | ❌ | — | — |
| Financeiro (clínica) | Clínicas | ❌ | — | — |
| Desativar clínica | Clínicas | ❌ | — | — |
| Adicionar Profissional | Profissionais | ❌ | — | — |
| Ver Perfil / Editar / Ver Agenda / Remover | Profissionais | ❌ | — | — |
| Novo Agendamento | Agenda | ❌ | — | — |
| Semana anterior / Hoje / Próxima semana | Agenda | ❌ | — | — |
| Nova Sessão | Sessões | ❌ | — | — |
| Novo Registro | Financeiro | ✅ | `/financial/records` | POST |
| Marcar como pago | Financeiro | ✅ | `/financial/records/:id` | PATCH |
| Excluir registro | Financeiro | ✅ | `/financial/records/:id` | DELETE |
| Exportar PDF | Relatórios | ❌ | — | — |
| Salvar (perfil, horários, senha, etc.) | Configurações | ❌ | — | — |

---

## 4. INTEGRAÇÃO COM API — INVENTÁRIO COMPLETO

### 4.1 Endpoints Utilizados

| Método | Endpoint | Onde é usado |
|--------|----------|--------------|
| GET | `/auth/login` | — (POST usado no login) |
| POST | `/auth/login` | AuthContext |
| POST | `/auth/register` | AuthContext |
| POST | `/auth/forgot-password` | AuthContext |
| POST | `/auth/update-password` | AuthContext |
| GET | `/clinics` | useClinics, ClinicContext |
| GET | `/clinics/:id/professionals` ou `/professionals` | useProfessionals |
| GET | `/patients` | usePatients |
| GET | `/patients/:id` | usePatient |
| GET | `/patients/count` | useDashboardStats |
| GET | `/patients/recent` | useRecentPatients |
| POST | `/patients` | usePatients (AddPatientDialog) |
| PUT | `/patients/:id` | EditPatientModal |
| DELETE | `/patients/:id` | usePatients |
| POST | `/patients/import` | ImportPatientsModal |
| GET | `/appointments?start=&end=` | useCalendarAppointments, useMiniCalendarDays |
| GET | `/appointments/today` | useDashboardStats, useTodayAppointments |
| GET | `/sessions` | useSessionsData |
| GET | `/sessions/stats` | useDashboardStats |
| GET | `/financial/records` | useFinancialRecords |
| POST | `/financial/records` | useFinancialRecords |
| PATCH | `/financial/records/:id` | useFinancialRecords |
| DELETE | `/financial/records/:id` | useFinancialRecords |
| GET | `/financial/summary` | useDashboardStats |
| GET | `/reports` | useReportsData |

### 4.2 Endpoints NÃO Implementados (mas necessários pela UI)

| Método | Endpoint esperado | Uso |
|--------|-------------------|-----|
| POST | `/clinics` | Nova Clínica |
| PUT | `/clinics/:id` | Editar Clínica |
| POST | `/appointments` | Novo Agendamento |
| POST | `/sessions` | Nova Sessão |
| GET | `/users/me` ou `/profile` | Perfil em Configurações |
| PUT | `/users/me` ou `/profile` | Salvar perfil |
| PUT | `/users/schedule` | Salvar horários |
| PUT | `/users/password` | Atualizar senha |

---

## 5. DASHBOARD — CARDS

| Card | Fonte | Status |
|------|-------|--------|
| Pacientes Ativos | `GET /patients/count` | ✅ Backend |
| Consultas Hoje | `GET /appointments/today` | ✅ Backend |
| Taxa de Retorno | `GET /sessions/stats` | ✅ Backend |
| Horas Atendidas | `GET /sessions/stats` (campo hoursThisWeek) | ✅ Backend (se existir) |
| "+3 este mês" (subtexto) | Hardcoded | ❌ Mock |

---

## 6. PACIENTES — RESUMO

| Ação | Integrado | Endpoint |
|------|-----------|----------|
| Criação | ✅ | POST /patients |
| Edição | ✅ | PUT /patients/:id |
| Exclusão | ✅ | DELETE /patients/:id |
| Visualização do perfil | ✅ | GET /patients/:id |
| Importação Excel | ✅ | POST /patients/import |

---

## 7. PROFISSIONAIS — VÍNCULO COM CLÍNICA

- `useProfessionals` recebe `selectedClinic?.id` e chama `GET /clinics/:id/professionals` ou `GET /professionals`.
- O `ClinicContext` fornece `selectedClinic` e `clinicId` (header `X-Clinic-Id`).
- A listagem está vinculada à clínica selecionada. ✅
- Não há CRUD de profissionais no frontend. ❌

---

## 8. DADOS MOCKADOS

| Local | Descrição |
|-------|-----------|
| `Index.tsx` (Dashboard) | `change={stats ? "+3 este mês" : undefined}` no StatCard "Pacientes Ativos" |
| `Settings.tsx` | Perfil completo (Dra. Maria Costa, CRP, email, telefone, especialidades) |
| `Settings.tsx` | Horários de atendimento (08:00–18:00, 50 min/sessão) |
| `Settings.tsx` | Lista de integrações (PsiPro App, Google Calendar, WhatsApp, Gateway) |
| `input-otp.tsx` | `hasFakeCaret` — parte do componente Radix UI, não é dado de negócio |
| `useReportsData` | Fallback `stats = { totalSessions: 0, ... }` quando API retorna vazio — comportamento de segurança |

---

## 9. PROBLEMAS IDENTIFICADOS

### 9.1 Botões sem função

- Nova Clínica
- Editar / Ver profissionais / Financeiro / Desativar (Clínicas)
- Adicionar Profissional
- Ver Perfil / Editar / Ver Agenda / Remover (Profissionais)
- Novo Agendamento
- Semana anterior / Hoje / Próxima semana (Agenda)
- Nova Sessão
- Exportar PDF (Relatórios)
- Salvar Alterações / Salvar Horários / Atualizar Senha / Ativar 2FA / Conectar (Configurações)

### 9.2 APIs inexistentes ou não utilizadas

- `POST /clinics` — botão presente, não chamado
- `PUT /clinics/:id` — botão presente, não chamado
- `POST /appointments` — botão presente, não chamado
- `POST /sessions` — botão presente, não chamado
- Endpoints de perfil/ configurações do usuário — inexistentes no frontend

### 9.3 Funções incompletas

- Agenda: `weekStart` não é passado ao `refetch`; navegação de semanas não reflete nos dados
- Sessões: `?patientId=` na URL não é usado para filtrar (useSessionsData não suporta)

### 9.4 Dados não persistidos

- Configurações: nenhum dado é salvo no backend
- Clínicas: somente leitura
- Profissionais: somente leitura
- Agenda: sem criação de agendamentos
- Sessões: sem criação de sessões

### 9.5 Debug em produção

- `api.ts`: `console.log("baseURL:", ...)` e `console.log("[API] Financial request:", ...)`
- `useFinancialRecords.ts`: `console.log("Financial API response:", res)`

---

## 10. RELATÓRIO FINAL — TABELA DE CORREÇÕES

| Funcionalidade | Status | Problema | Correção necessária |
|----------------|--------|----------|---------------------|
| Dashboard — Pacientes Ativos | ⚠️ | Subtexto "+3 este mês" hardcoded | Buscar variação real da API ou remover |
| Clínicas — Nova Clínica | ❌ | Sem onClick | Modal + `POST /clinics` |
| Clínicas — Editar | ❌ | Sem onClick | Modal + `PUT /clinics/:id` |
| Clínicas — Ver profissionais | ❌ | Sem onClick | Navegar para `/psychologists` com clinicId |
| Clínicas — Financeiro | ❌ | Sem onClick | Navegar para `/financials` com filtro |
| Clínicas — Desativar | ❌ | Sem onClick | `PATCH /clinics/:id` com status |
| Profissionais — Adicionar | ❌ | Sem onClick | Modal + `POST /clinics/:id/professionals` ou similar |
| Profissionais — Ações dropdown | ❌ | Sem onClick | Implementar perfil, edição, agenda, remoção |
| Agenda — Navegação de semana | ❌ | Botões sem onClick | Passar `weekStart` ao `refetch` |
| Agenda — Novo Agendamento | ❌ | Sem onClick | Modal + `POST /appointments` |
| Sessões — Nova Sessão | ❌ | Sem onClick | Modal + `POST /sessions` |
| Sessões — Filtro por paciente | ⚠️ | URL tem patientId, não filtra | Suportar `?patientId=` em useSessionsData |
| Relatórios — Exportar PDF | ❌ | Sem onClick | Implementar geração/ download de PDF |
| Configurações — Perfil | ❌ | Dados mockados | `GET/PUT /users/me` ou `/profile` |
| Configurações — Horários | ❌ | Dados mockados | API de horário de atendimento |
| Configurações — Segurança | ❌ | Sem API | `PUT /users/password`, 2FA |
| Configurações — Integrações | ❌ | Dados mockados | APIs de OAuth/ integração |
| Debug em produção | ⚠️ | console.log em api.ts e useFinancialRecords | Remover ou condicionar a dev |

---

## 11. REQUISITO BACKEND — FILTRO DE CLÍNICAS

**GET /clinics** deve retornar **apenas as clínicas do usuário autenticado**:
- Clínicas onde o usuário é proprietário
- Clínicas onde o usuário foi adicionado como profissional ou administrador

**Não** deve retornar clínicas de exemplo, seed data ou de outros usuários. Caso contrário, ao fazer login a usuária verá consultórios que não são dela.

---

## 12. RESUMO EXECUTIVO

| Área | Integração | Observação |
|------|------------|------------|
| **Autenticação** | ✅ 100% | Login, registro, forgot, reset |
| **Pacientes** | ✅ 100% | CRUD, importação, perfil |
| **Financeiro** | ✅ 100% | CRUD de registros |
| **Dashboard** | ⚠️ ~95% | Um label mockado |
| **Relatórios** | ⚠️ ~90% | Leitura OK; exportação PDF ausente |
| **Clínicas** | ❌ ~20% | Somente leitura |
| **Profissionais** | ❌ ~20% | Somente leitura |
| **Agenda** | ❌ ~40% | Leitura OK; criação e navegação ausentes |
| **Sessões** | ❌ ~30% | Somente leitura |
| **Configurações** | ❌ 0% | Tela inteira mockada |

**Prioridades sugeridas:**
1. Remover `console.log` de debug
2. Implementar Configurações (perfil, horários, senha)
3. Implementar Nova Clínica e edição
4. Implementar Novo Agendamento e navegação de semana
5. Implementar Nova Sessão
6. Implementar CRUD de Profissionais
7. Implementar Exportar PDF
8. Remover ou corrigir "+3 este mês" no Dashboard
