# Prompt: Igualar Agenda do App à Agenda do Dashboard Web

Use este prompt quando for implementar ou ajustar a **agenda/calendário do app mobile (Psipro)** para que fique igual à agenda do **dashboard web**.

---

## Objetivo

A agenda do app deve ter o mesmo comportamento e layout da agenda do dashboard web:
- **7 dias** na semana (incluindo sábado e domingo)
- **Horário** das **07:00 às 22:00** (16 horas)
- **Exibir as consultas** corretamente em cada dia/hora

---

## Especificações da Agenda (alinhadas ao dashboard)

### 1. Dias da semana
- A semana deve ir de **domingo a sábado**
- Colunas: `["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]`
- O primeiro dia da semana exibido é o **domingo** (domingo = dia 0)

### 2. Horário
- Início: **07:00** (7h da manhã)
- Fim: **22:00** (10h da noite)
- Intervalo: 1 hora (07:00, 08:00, 09:00, ..., 22:00)
- Total: **16 linhas de hora**

### 3. Início da semana no calendário
- A semana exibida começa no **domingo** (`getDay() === 0`)
- Para obter o “início da semana” a partir de uma data: `data.getDate() - data.getDay()`
- Período de busca: domingo 00:00 até sábado 23:59:59 (7 dias)

### 4. Exibição das consultas
- Cada consulta deve aparecer na **célula** correspondente ao dia da semana (0–6) e à hora cheia
- Campos usados na API: `scheduledAt`, `scheduled_at`, `date`, `start_at` ou `startsAt`
- Nome do paciente: `patient.name` ou `patient.full_name` ou `patient_name`
- Filtrar consultas pelo período da semana exibida (backend pode retornar todas; filtrar no cliente)

### 5. API
- Endpoint: `GET /appointments?start=YYYY-MM-DD&end=YYYY-MM-DD`
- Header: `X-Clinic-Id` (clínica selecionada)
- O backend pode ignorar `start`/`end` e retornar todas; nesse caso, aplicar filtro de data no cliente

### 6. Status e cores (opcional)
- `confirmed` / `agendada` / `scheduled` → destaque primário
- `pending` / `pendente` → destaque âmbar/amarelo
- `completed` / `realizada` → neutro/cinza

---

## Exemplo de lógica (para referência)

```text
Dias da semana: ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
Horas: 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22

Início da semana = domingo 00:00
Fim da semana = sábado 23:59:59

Para cada consulta:
  - data = scheduledAt ou scheduled_at ou date ou start_at ou startsAt
  - dia_index = (data - inicio_semana) em dias (0 = domingo, 6 = sábado)
  - hora = horas da data (parte inteira)
  - Colocar na célula [dia_index][hora]
```

---

## Arquivos de referência no dashboard web

- `src/pages/Calendar.tsx` – layout, dias, horas e exibição
- `src/hooks/useCalendarAppointments.ts` – busca de dados e mapeamento

---

## Checklist de implementação

- [ ] Semana com 7 dias (domingo a sábado)
- [ ] Horário das 07:00 às 22:00 (16 horas)
- [ ] Semana começando no domingo
- [ ] Uso correto de `scheduledAt` / `scheduled_at` / `date` / `start_at` / `startsAt`
- [ ] Nome do paciente vindo de `patient.name` ou equivalente
- [ ] Consultas filtradas pelo período da semana exibida
- [ ] Navegação entre semanas (anterior / próxima / hoje)
