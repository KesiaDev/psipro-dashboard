# Feature: Recorrência de Sessões

## Contexto

A Agenda exibe sessões criadas via **app** e via **web**. Atualmente há duplicação em alguns casos (ex.: segundas-feiras) quando o mesmo evento aparece em `GET /appointments` e `GET /sessions`. A deduplicação no frontend foi reforçada para reduzir isso.

Para sessões que **realmente se repetem** (ex.: toda segunda às 18h), é necessário suportar **recorrência** em vez de criar várias sessões separadas.

## Requisitos da funcionalidade de recorrência

### Backend

1. **Modelo de dados**
   - Adicionar campos em `Session` (ou equivalente): `recurrenceRule`, `recurrenceEndDate`, `parentSessionId` (para instâncias de série)
   - Ou criar entidade `RecurrenceRule` vinculada à sessão

2. **Regras de recorrência**
   - Diária, semanal, quinzenal, mensal
   - Dia da semana (ex.: toda segunda)
   - Data fim da série ou número de ocorrências

3. **APIs**
   - `POST /sessions` e `PATCH /sessions/:id` aceitarem `recurrence` no payload
   - `GET /sessions` e `GET /appointments` expandirem sessões recorrentes nas instâncias do período solicitado (ou retornar regra + instâncias)

### Frontend (Web)

1. **Criação/edição de sessão**
   - Checkbox "Sessão recorrente"
   - Seletor: frequência (semanal, etc.), dia da semana, data fim

2. **Agenda**
   - Exibir cada instância da série no slot correto
   - Ao clicar em instância recorrente, permitir editar "apenas esta" ou "todas as futuras"

### App

- Mesma lógica de recorrência na criação/edição e na exibição da agenda

## Prioridade

- **Alta**: Resolver duplicação (já melhorado no frontend)
- **Média**: Implementar recorrência quando o backend suportar
