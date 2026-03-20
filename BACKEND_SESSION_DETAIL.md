# Backend: Endpoint GET /sessions/:id

## Problema

A página de detalhe da sessão (`/sessions/:id`) retorna erro **404 - Sessão não encontrada** com a mensagem:
```
Cannot GET /api/sessions/{id}
```

O frontend chama `GET /sessions/:id` para exibir os dados de uma sessão específica, mas o endpoint não existe ou não está configurado corretamente.

---

## O que implementar

### Endpoint

```
GET /sessions/:id
```

ou, se a API usar prefixo global:

```
GET /api/sessions/:id
```

### Headers esperados

| Header | Obrigatório | Descrição |
|--------|-------------|-----------|
| `Authorization` | Sim | `Bearer {token}` |
| `X-Clinic-Id` | Sim | ID da clínica (filtrar sessões por clínica) |

### Parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `id` | UUID | ID da sessão |

### Resposta esperada (200 OK)

```json
{
  "id": "ab7dc18d-fe24-46c0-b3e3-1e978b6d7d14",
  "patient_id": "uuid-do-paciente",
  "patient_name": "Nome do Paciente",
  "patient": { "name": "Nome do Paciente" },
  "professional_id": "uuid-do-profissional",
  "scheduled_at": "2026-03-06T17:00:00.000Z",
  "start_at": "2026-03-06T17:00:00.000Z",
  "date": "2026-03-06T17:00:00.000Z",
  "duration_minutes": 50,
  "duration": 50,
  "type": "Consulta",
  "session_type": "Consulta",
  "status": "realizada",
  "notes": "Notas da sessão...",
  "clinical": {
    "emotional_state": 7,
    "evolution_notes": "Paciente demonstrou melhora...",
    "interventions": "TCC, reestruturação cognitiva",
    "homework": "Registro de pensamentos automáticos",
    "risk_status": "normal"
  },
  "aiAnalysis": {
    "summary": "Resumo da sessão...",
    "themes": ["Tema 1", "Tema 2"],
    "emotions": ["Emoção 1", "Emoção 2"],
    "actionItems": ["Tarefa 1"],
    "riskFlags": []
  }
}
```

O frontend aceita variações de nomes de campos (camelCase ou snake_case).

### Respostas de erro

| Status | Quando |
|--------|--------|
| 401 | Token inválido ou ausente |
| 403 | Sessão pertence a outra clínica / sem permissão |
| 404 | Sessão não encontrada |

---

## Frontend

- **Hook:** `useSessionDetail` em `src/hooks/useSessionDetail.ts`
- **Chamada:** `api.get(\`/sessions/${id}\`)`
- **Base URL:** `VITE_API_URL` (ex: `https://psipro-api.railway.app` ou `https://psipro-api.railway.app/api`)

---

## Checklist para o backend

- [ ] Implementar `GET /sessions/:id`
- [ ] Validar `X-Clinic-Id` e filtrar por clínica
- [ ] Retornar 404 quando a sessão não existir ou não pertencer à clínica
- [ ] Incluir `patient_name` ou `patient.name` no response
- [ ] Incluir `start_at`, `scheduled_at` ou `date` para data/hora
- [ ] (Opcional) Incluir `aiAnalysis` se houver análise de IA
- [ ] (Opcional) Incluir `clinical` com: `emotional_state` (1-10), `evolution_notes`, `interventions`, `homework`, `risk_status` (normal/low/medium/high)

### PATCH /sessions/:id — Campos clínicos

O frontend envia `clinical` no body ao editar sessão:

```json
{
  "clinical": {
    "emotional_state": 7,
    "evolution_notes": "Evolução do paciente...",
    "interventions": "Técnicas utilizadas...",
    "homework": "Tarefas de casa...",
    "risk_status": "normal"
  }
}
```

O backend deve persistir e retornar `clinical` no GET.
