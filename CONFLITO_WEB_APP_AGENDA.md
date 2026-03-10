# Conflito Web vs App – Agenda não sincronizada

## Situação
- **Web**: Mostra o agendamento (ex: Duda Rocha, Seg 2 mar, 15h, CONSULTA)
- **App**: Não mostra o mesmo agendamento

## Como a Web busca os dados

| Fonte | Endpoint | Filtros |
|-------|----------|---------|
| Agendamentos | `GET /appointments?start=YYYY-MM-DD&end=YYYY-MM-DD` | `X-Clinic-Id` no header |
| Sessões | `GET /sessions` | `X-Clinic-Id` no header |

A web combina **appointments** e **sessions** na mesma grade da Agenda.

## Possíveis causas no App

### 1. **Clínica diferente (X-Clinic-Id)**
- Web envia `X-Clinic-Id` com a clínica selecionada.
- Se o app não enviar ou enviar outra clínica, o backend pode retornar dados diferentes.

**O que conferir no app:**
- O app envia o header `X-Clinic-Id`?
- O usuário está na mesma clínica no app e na web?

### 2. **Filtro por profissional**
- O app pode filtrar só agendamentos do profissional logado.
- A web mostra todos os agendamentos da clínica.

**O que conferir no backend:**
- `GET /appointments` filtra por `professionalId` quando chamado pelo app?
- Há diferença de lógica entre web e app?

### 3. **Datas diferentes**
- Web: semana Seg–Sex (5 dias) com `start` e `end`.
- App: pode usar outro intervalo (ex.: dia atual, mês, etc.).

**O que conferir no app:**
- Qual intervalo de datas o app usa?
- O agendamento está dentro desse intervalo?

### 4. **Appointments vs Sessions**
- Web usa **appointments** e **sessions**.
- Se o agendamento foi criado como **sessão** (`POST /sessions`), o app pode estar consultando só **appointments** (`GET /appointments`).

**O que conferir no app:**
- O app chama `GET /sessions` ou só `GET /appointments`?
- O backend retorna sessões em `GET /appointments` ou são recursos separados?

### 5. **Base URL / ambiente**
- Web e app podem apontar para backends diferentes (dev, staging, prod).

**O que conferir:**
- Mesma `VITE_API_URL` / URL da API no app e na web?

## Checklist para o desenvolvedor do App

- [ ] App envia `X-Clinic-Id` em todas as requisições?
- [ ] App busca `GET /appointments` com `start` e `end`?
- [ ] App busca `GET /sessions` ou o backend unifica sessões em appointments?
- [ ] App filtra por profissional? Se sim, o agendamento pertence a esse profissional?
- [ ] App usa o mesmo backend (mesma URL) que a web?
- [ ] Formato de data: app envia `start` e `end` em ISO (YYYY-MM-DD)?

## Sugestão no Backend

Para manter consistência entre web e app, o backend pode:

1. **Unificar** `GET /appointments` para retornar também sessões (ou vice-versa).
2. **Documentar** se `X-Clinic-Id` é obrigatório e como o filtro por profissional funciona.
3. **Garantir** que web e app usem os mesmos critérios de filtro quando fizer sentido.
