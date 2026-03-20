# Backend: Respeitar status em POST /financial/records

## Problema

O usuário cria um registro financeiro com status **"Pendente"** no frontend, mas o registro é salvo/exibido como **"Pago"**.

## Causa provável

O backend pode estar:
- Ignorando o campo `status` no body da requisição
- Aplicando um valor padrão `"paid"` no DTO ou no service
- Sobrescrevendo o status em alguma lógica de negócio

## O que o frontend envia

```json
{
  "type": "income",
  "category": "session",
  "description": "Sessão1",
  "amount": 120,
  "payment_method": null,
  "status": "pending",
  "due_date": null,
  "patient_id": null
}
```

## O que o backend deve fazer

- **POST /financial/records**: usar o `status` enviado no body (`"pending"`, `"paid"`, `"overdue"`, `"cancelled"`)
- Se `status` não for enviado, aí sim usar default `"pending"`
- **PATCH /financial/records/:id**: respeitar o `status` enviado (incluindo `paid_at: null` quando mudar para pendente)

## Verificar

No controller/service de `financial/records`, conferir se o DTO aceita `status` e se o valor é persistido sem ser sobrescrito.

---

## Criação automática ao registrar sessão

Ao criar uma sessão ou agendamento, o frontend cria automaticamente um registro financeiro **pendente**:

```json
{
  "type": "income",
  "category": "session",
  "description": "Sessão - Nome do Paciente - 21/03/2026",
  "amount": 0,
  "status": "pending",
  "patient_id": "uuid-do-paciente",
  "session_id": "uuid-da-sessao"
}
```

O backend deve:
- Aceitar `amount: 0` para registros pendentes (o terapeuta preenche o valor depois)
- Aceitar e persistir `session_id` (vínculo sessão ↔ cobrança)
