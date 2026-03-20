# Requisitos do Backend PsiPro — Para rodar o Dashboard corretamente

Este documento consolida tudo que o **backend PsiPro** precisa implementar ou ajustar para o dashboard web funcionar corretamente.

---

## 1. Headers obrigatórios em todas as requisições

| Header | Descrição |
|--------|-----------|
| `Authorization` | `Bearer {token}` — token JWT do login |
| `X-Clinic-Id` | ID da clínica selecionada (filtro de dados) |

---

## 2. Pacientes

### POST `/patients` — Criar paciente

**Body aceito:**
```json
{
  "name": "Nome completo",
  "full_name": "Nome completo",
  "status": "active",
  "email": "email@exemplo.com",
  "phone": "(11) 99999-9999",
  "birthDate": "1990-05-15",
  "cpf": "123.456.789-00",
  "observations": "Observações gerais",
  "gender": "male",
  "profession": "Professora"
}
```

- **Obrigatório:** `name` ou `full_name`
- **Opcionais:** email, phone, birthDate, cpf, observations, status, **gender**, **profession**
- Aceitar `gender` e `profession` (novos campos da ficha de acolhimento)

### PATCH `/patients/:id` — Atualizar paciente

- Aceitar `anamnesis` no body (objeto JSON com `items` e `updatedAt`)
- Aceitar `progress` (`"improving"` | `"stable"` | `"attention"`) para evolução clínica

### GET `/patients/:id`

- Retornar `anamnesis` (ou `anamnesis_data` / `anamnesisData`) quando existir
- Retornar `progress` quando existir

### DELETE `/patients/:id`

- Implementar endpoint (404 indica que não existe)

---

## 3. Sessões

### GET `/sessions/:id` — Detalhe da sessão

**Implementar endpoint.** O frontend chama para exibir a página de detalhe da sessão.

**Resposta esperada:**
```json
{
  "id": "uuid",
  "patient_id": "uuid",
  "patient_name": "Nome do Paciente",
  "professional_id": "uuid",
  "scheduled_at": "2026-03-06T17:00:00.000Z",
  "start_at": "2026-03-06T17:00:00.000Z",
  "duration_minutes": 50,
  "type": "Consulta",
  "status": "realizada",
  "notes": "Notas da sessão",
  "clinical": {
    "emotional_state": 7,
    "evolution_notes": "...",
    "interventions": "...",
    "homework": "...",
    "risk_status": "normal"
  },
  "aiAnalysis": { "summary": "...", "themes": [], "emotions": [], "actionItems": [], "riskFlags": [] }
}
```

### PATCH `/sessions/:id`

**Aceitar no body:**
- `patientId`, `date`, `professionalId`, `duration`, `notes`
- **`type`** — tipo da sessão (Consulta, Avaliação, etc.)
- **`clinical`** — objeto com: `emotional_state`, `evolution_notes`, `interventions`, `homework`, `risk_status`

*Atualmente o frontend não envia `type` e `clinical` porque o backend retorna 400. Ao aceitar, o frontend pode ser reativado.*

### DELETE `/sessions/:id`

- Implementar endpoint (404 indica que não existe)

---

## 4. Financeiro

### POST `/financial/records`

**Respeitar o `status` enviado** (`"pending"`, `"paid"`, `"overdue"`, `"cancelled"`). Não sobrescrever com default.

**Aceitar:**
- `amount: 0` — registros pendentes criados automaticamente ao agendar sessão
- `session_id` — vínculo sessão ↔ cobrança

**Exemplo de payload automático:**
```json
{
  "type": "income",
  "category": "session",
  "description": "Sessão - Nome do Paciente - 21/03/2026",
  "amount": 0,
  "status": "pending",
  "patient_id": "uuid",
  "session_id": "uuid-da-sessao"
}
```

### PATCH `/financial/records/:id`

- Respeitar `status`, `amount`, `payment_method`, `paid_at`

---

## 5. Anamnese

### Estrutura

```json
{
  "anamnesis": {
    "items": [
      { "key": "queixa_principal", "label": "Queixa principal", "value": "Texto...", "isCustom": false },
      { "key": "doencas_previas", "label": "Doenças prévias", "value": "...", "isCustom": false }
    ],
    "updatedAt": "2025-03-11T12:00:00.000Z"
  }
}
```

### Endpoints

- **GET `/patients/:id`** — retornar `anamnesis` quando existir
- **PATCH `/patients/:id`** — aceitar `anamnesis` no body e persistir (coluna JSONB)

---

## 6. Outros endpoints usados pelo dashboard

| Método | Rota | Uso |
|--------|------|-----|
| POST | `/auth/login` | Login |
| GET | `/clinics` | Lista de clínicas |
| GET | `/clinics/:id/professionals` | Profissionais da clínica |
| GET | `/patients` | Lista de pacientes |
| GET | `/patients/count` | Contagem (Dashboard) |
| GET | `/patients/recent` | Pacientes recentes |
| GET | `/appointments?start=&end=` | Agenda |
| GET | `/appointments/today` | Consultas de hoje |
| POST | `/appointments` | Novo agendamento |
| PATCH | `/appointments/:id` | Alterar data/hora |
| DELETE | `/appointments/:id` | Cancelar agendamento |
| GET | `/sessions` | Lista de sessões |
| POST | `/sessions` | Nova sessão |
| GET | `/financial/records` | Registros financeiros |
| GET | `/financial/summary` | Resumo (Dashboard) |
| GET | `/reports` | Relatórios |

---

## 7. Resumo — Checklist para o backend

- [ ] **Pacientes:** Aceitar `gender` e `profession` no POST; `anamnesis` e `progress` no PATCH
- [ ] **Sessões:** Implementar `GET /sessions/:id`; aceitar `type` e `clinical` no PATCH; implementar `DELETE /sessions/:id`
- [ ] **Financeiro:** Respeitar `status`; aceitar `amount: 0` e `session_id`
- [ ] **Pacientes:** Implementar `DELETE /patients/:id` (se ainda não existir)
- [ ] **Agenda:** Implementar `PATCH /appointments/:id` e `DELETE /appointments/:id` (editar/cancelar na agenda)

---

## 8. URL base

O dashboard usa `VITE_API_URL` (ex: `https://psipro-backend-production.up.railway.app`). Se o backend usa prefixo `/api`, a URL base já deve incluir ou o frontend precisa ajustar.
