# Relatório de Auditoria – PsiPro Dashboard

**Data:** 1 de março de 2025  
**Objetivo:** Garantir que o dashboard funcione de ponta a ponta, sincronizado com o backend e o app PsiPro Mobile.

---

## 1. Rotas verificadas

| Rota | Componente | Status |
|------|------------|--------|
| `/` | Index (Dashboard) | OK |
| `/clinics` | Clinics | OK |
| `/psychologists` | Psychologists | OK |
| `/financials` | Financials | OK |
| `/patients` | Patients | OK |
| `/patients/:id` | PatientDetail | OK |
| `/calendar` | Calendar | OK |
| `/sessions` | Sessions | OK |
| `/sessions/:id` | SessionDetail | OK |
| `/reports` | Reports | OK |
| `/settings` | Settings | OK |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Auth pages | OK |
| `*` | NotFound | OK |

**Todas as rotas possuem:** `ProtectedRoute` + `ClinicGate` (exceto auth e NotFound).

---

## 2. Endpoints corrigidos

| Antes | Depois | Arquivo |
|-------|--------|---------|
| `PUT /users/me/password` | `PUT /users/password` | `useProfile.ts` |
| `PUT /patients/:id` | `PATCH /patients/:id` | `edit-patient-modal.tsx` |
| Backend sem `GET /sessions/:id` | Endpoint adicionado | `sessions.controller.ts` (backend) |
| Backend sem `PATCH /sessions/:id` | Endpoint adicionado | `sessions.controller.ts` (backend) |

### Endpoints existentes e compatíveis

- `/auth/login`, `/auth/register`, `/auth/forgot-password`, `/auth/handoff`
- `/users/me`, `PUT /users/me`, `PUT /users/password`
- `/clinics`, `GET /clinics/:clinicId/professionals`
- `/patients`, `/patients/:id`, `/patients/import`, `/patients/recent`, `/patients/count`, `/patients/:id/patterns`
- `/sessions`, `/sessions/stats`, `/sessions/:id` (GET, PATCH, DELETE)
- `/appointments`, `/appointments/today`
- `/financial/records`, `/financial/summary`
- `/professionals`
- `/reports`

---

## 3. Botões corrigidos

| Local | Botão | Ação |
|-------|-------|------|
| AppSidebar | Logout | Agora chama `signOut()` antes de navegar (antes só navegava) |
| Settings | Salvar Horários | Desabilitado (title: "Em breve") |
| Settings | Ativar (2FA) | Desabilitado (title: "Em breve") |

---

## 4. Sincronização com app mobile

- Dashboard e app usam os mesmos endpoints: `/patients`, `/sessions`, `/appointments`, `/financial/records`
- Dados criados no app aparecem no dashboard via backend compartilhado
- `X-Clinic-Id` é enviado em todas as requisições autenticadas

---

## 5. Proteção de rotas

| Componente | Função |
|------------|--------|
| `ProtectedRoute` | Verifica autenticação; redireciona para `/login` se não autenticado |
| `ClinicGate` | Garante `clinicId` antes de carregar conteúdo; exibe loading/erro |
| `AuthProvider` | Gerencia token e usuário |
| `ClinicProvider` | Gerencia clínica selecionada e `x-clinic-id` |

---

## 6. Código de debug removido

| Arquivo | Alteração |
|---------|-----------|
| `NotFound.tsx` | Removido `console.error` em `useEffect` |
| `exportReportsPdf.ts` | Removido `console.error` no `catch` |
| `api.ts` | `console.error` substituído por `console.warn` apenas em `DEV` |

---

## 7. Ajustes de carregamento e dados

| Área | Ajuste |
|------|--------|
| SessionDetail | Fallback quando `GET /sessions/:id` retorna 404: usa sessão da lista ou `sessionFromList` |
| SessionDetail | Botão Editar funciona com sessão vinda da API ou da lista |
| useSessionsData | Inclusão de `duration` no payload de `updateSession` |
| EditSessionDialog | Usa `sessionForEdit` (API ou lista) para edição |

---

## 8. Arquivos modificados

### Frontend (psipro-dashboard)

- `src/hooks/useProfile.ts` – endpoint de alteração de senha
- `src/hooks/useSessionsData.ts` – `duration` no payload de update
- `src/components/patients/edit-patient-modal.tsx` – PUT → PATCH
- `src/components/AppSidebar.tsx` – logout chamando `signOut()`
- `src/pages/Settings.tsx` – botões desabilitados com `title="Em breve"`
- `src/pages/NotFound.tsx` – remoção de `console.error`
- `src/utils/exportReportsPdf.ts` – remoção de `console.error`
- `src/services/api.ts` – ajuste de log de env
- `src/pages/SessionDetail.tsx` – fallback de sessão e `sessionForEdit`

### Backend (Psipro/backend)

- `src/sessions/dto/update-session.dto.ts` – **novo**
- `src/sessions/sessions.controller.ts` – `GET :id` e `PATCH :id`
- `src/sessions/sessions.service.ts` – `findOne` e `update`
- `src/auth/auth.service.ts` – `clinicId: 'system'` em `forgot_password_requested` para `AuditLogParams`

---

## 9. Observações

1. **Backend:** Build concluído com sucesso após correção em `auth.service.ts`.
2. **Dashboard:** Build concluído com sucesso.
3. **DELETE /sessions/:id:** backend já suportava; uso está correto no frontend.

---

## 10. Checklist final

- [x] Rotas funcionais
- [x] Endpoints alinhados ao backend
- [x] Botões com ação real ou desabilitados com indicação
- [x] Sincronização com app mobile via mesmos endpoints
- [x] Logout limpando token e estado
- [x] `console.log` e código de debug removidos
- [x] Proteção de rotas (AuthGuard, ClinicGate)
- [x] Fallback de sessão na página de detalhe
- [x] GET e PATCH de sessões implementados no backend
