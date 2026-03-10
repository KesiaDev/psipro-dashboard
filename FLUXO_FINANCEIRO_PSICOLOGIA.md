# Fluxo Financeiro para Psicólogos — Especificação

## Visão geral

Este documento define o fluxo correto desde o agendamento até o pagamento, com base em práticas de consultórios de psicologia. Cada psicólogo pode configurar suas próprias regras (configurável de psicólogo para psicólogo).

---

## 1. Sequência do fluxo (Agenda → Pagamento)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  1. AGENDAMENTO  │ ──► │ 2. FORMA DE PAG. │ ──► │  3. CONSULTA    │ ──► │ 4. REGISTRO $   │
│  (Agenda/Sessão) │     │  (definir antes)  │     │  (realizada)    │     │  (Financeiro)   │
└─────────────────┘     └──────────────────┘     └─────────────────┘     └─────────────────┘
```

### Etapa 1: Agendamento
- Paciente agenda via **web** ou **app**
- Dados: paciente, profissional, data/hora, tipo (Consulta, Avaliação, etc.)

### Etapa 2: Definir forma de pagamento (no agendamento ou antes da consulta)
O paciente ou o psicólogo define **como** será pago. Opções:

| Opção | Descrição | Momento típico |
|-------|-----------|----------------|
| **Pagar online** | Pagamento antecipado (cartão, PIX) ao agendar | No agendamento |
| **Plano de saúde** | Convênio cobre; psicólogo recebe do plano | Definir no agendamento |
| **PIX** | Transferência PIX (antes ou depois) | Antes ou após a sessão |
| **Pagar após a consulta** | Dinheiro, cartão ou PIX no consultório | Após a sessão |

### Etapa 3: Consulta realizada
- Sessão marcada como "realizada" no sistema

### Etapa 4: Registro financeiro
- Cobrança registrada no Financeiro (manual hoje; ideal: automático ou 1 clique a partir da sessão)
- Status: Pago ou Pendente

---

## 2. Opções de pagamento (o que o sistema deve oferecer)

### 2.1 Pagar online (antecipado)
- **Quando**: No momento do agendamento ou antes da consulta
- **Benefício**: Reduz no-show; psicólogo já recebe
- **Implementação**: Gateway de pagamento (Stripe, Mercado Pago, PagSeguro, etc.)
- **Configurável**: Psicólogo ativa/desativa; define se é obrigatório ou opcional

### 2.2 Plano de saúde
- **Quando**: Definido no agendamento (paciente informa número da carteirinha)
- **Fluxo**: Psicólogo atende → emite guia/nota → envia ao convênio → recebe reembolso
- **Configurável**: Quais planos o psicólogo aceita; valor de sessão por plano

### 2.3 PIX
- **Quando**: Antes (link enviado) ou após a consulta (QR code no consultório)
- **Implementação**: Integração com gateway ou chave PIX manual
- **Configurável**: Psicólogo define se aceita; chave PIX para recebimento

### 2.4 Pagar após a consulta
- **Quando**: No consultório, após a sessão
- **Formas**: Dinheiro, cartão, PIX
- **Configurável**: Psicólogo define se aceita; valor padrão da sessão

---

## 3. Configurabilidade por psicólogo

Cada psicólogo (profissional) deve poder configurar:

| Configuração | Descrição | Exemplo |
|--------------|-----------|---------|
| **Formas de pagamento aceitas** | Quais opções oferecer ao paciente | PIX, dinheiro, cartão; não aceita plano |
| **Pagamento antecipado obrigatório?** | Exigir pagamento online antes da consulta | Sim (reduz no-show) ou Não |
| **Valor padrão da sessão** | Valor por tipo (Consulta, Avaliação) | R$ 150 consulta; R$ 250 avaliação |
| **Planos de saúde aceitos** | Lista de convênios | Unimed, Bradesco Saúde, etc. |
| **Chave PIX** | Para recebimento via PIX | CPF, e-mail ou chave aleatória |
| **Política de cancelamento** | Cobrar ou não em caso de falta | Cobrar 50% se cancelar com < 24h |

### Onde configurar
- **Configurações** → aba "Financeiro" ou "Pagamentos"
- Ou em **Perfil do profissional** (se cada um tem seu perfil)
- Em clínicas com vários psicólogos: cada profissional tem suas configurações

---

## 4. Fluxo na interface (proposto)

### Ao agendar (Nova Sessão / Novo Agendamento)
1. Preencher: paciente, data, hora, profissional, tipo
2. **Novo campo**: "Forma de pagamento prevista"
   - Dropdown: Pagar online | Plano de saúde | PIX | Pagar após a consulta
3. Se "Pagar online" → redirecionar ou abrir modal de pagamento (quando houver gateway)
4. Se "Plano de saúde" → campo para número da carteirinha / plano

### Na sessão (detalhe ou lista)
- Botão **"Registrar cobrança"** → abre modal com:
  - Paciente, valor (pré-preenchido conforme configuração do profissional)
  - Forma de pagamento: PIX, Dinheiro, Cartão, Plano de saúde, Online (já pago)
  - Status: Pago / Pendente

### No Financeiro
- Registros vinculados à sessão (`session_id`)
- Filtros por período, paciente, profissional, status

---

## 5. Backend necessário

### Modelo de dados
- **Session/Appointment**: campo `paymentMethodPreference` (opcional): `online` | `health_plan` | `pix` | `after_session`
- **Session**: campo `healthPlanNumber` (opcional)
- **FinancialRecord**: já tem `session_id` (vincular cobrança à sessão)
- **Professional** (ou User): configurações de pagamento (JSON ou tabela `professional_payment_settings`)

### APIs
- `GET/PATCH /professionals/:id/settings` ou `GET/PATCH /profile/payment-settings` — configurações de pagamento do psicólogo
- `POST /financial/records` — aceitar `sessionId`, `paymentMethod`, etc.
- Futuro: `POST /payments` — gateway de pagamento (pagamento online)

---

## 6. Resumo da regra de sequência

1. **Agendar** → definir forma de pagamento prevista (online, plano, PIX, após)
2. **Opcional**: pagar online no ato do agendamento (quando configurado)
3. **Realizar** a consulta
4. **Registrar cobrança** (manual ou automático) com forma de pagamento efetiva
5. **Configurável**: cada psicólogo define quais opções oferece e valor padrão

---

## 7. Prioridade de implementação

| Prioridade | Item |
|------------|------|
| **Alta** | Campo "Forma de pagamento prevista" no agendamento; botão "Registrar cobrança" na sessão; vínculo sessão ↔ registro financeiro |
| **Média** | Configurações por profissional (valor padrão, formas aceitas) |
| **Média** | Pagamento online (gateway) |
| **Baixa** | Integração com planos de saúde (guia, faturamento) |
