# Prompt para implementar Anamnese no Backend

Copie e cole o bloco abaixo ao pedir ao Cursor (no projeto do backend):

---

## Implementar Anamnese de Pacientes

O frontend do psipro-dashboard já possui a tela de anamnese no detalhe do paciente. Implemente no backend NestJS o suporte completo para esse recurso.

### O que fazer

1. **Tabela `patients` (Prisma)**
   - Adicionar coluna `anamnesis` do tipo `Json` (ou `JsonB` no PostgreSQL) para armazenar os dados da anamnese.

2. **GET `/patients/:id`**
   - Incluir o campo `anamnesis` na resposta do paciente.
   - Se o paciente não tiver anamnese, retornar `null` ou objeto vazio.
   - O frontend aceita `anamnesis`, `anamnesis_data` ou `anamnesisData`.

3. **PATCH `/patients/:id`** ou **PATCH `/patients/:id/anamnesis`**
   - O frontend tenta `/patients/:id/anamnesis` primeiro; se 404, usa PATCH do paciente com `anamnesis` no body.
   - Opção A (endpoint dedicado): `PATCH /patients/:id/anamnesis` — body = `{ items, updatedAt }` diretamente.
   - Opção B: Aceitar `anamnesis` no body do PATCH `/patients/:id`.
   - Estrutura esperada:
   ```json
   {
     "anamnesis": {
       "items": [
         {
           "key": "string",
           "label": "string",
           "value": "string",
           "isCustom": false
         }
       ],
       "updatedAt": "2025-03-11T12:00:00.000Z"
     }
   }
   ```
   - Persistir o campo `anamnesis` no paciente.
   - O DTO de update deve incluir `anamnesis` como campo opcional.

4. **Validação**
   - Validar que `items` seja um array.
   - Cada item deve ter `key`, `label` e `value` (strings).
   - `isCustom` é opcional (boolean).

### Estrutura completa de um item

- `key`: identificador único (ex: `historia_pessoal`, `custom_1234567890`)
- `label`: rótulo exibido (ex: "História pessoal", "Rede de apoio")
- `value`: conteúdo preenchido pelo psicólogo
- `isCustom`: `true` para campos criados pelo profissional

### Campos padrão usados no frontend (apenas referência)

historia_pessoal, queixa_principal, motivo_consulta, hipotese_observacao, antecedentes_familiares, historico_tratamentos, uso_medicacoes, funcionamento_social, expectativas_terapia, sono_alimentacao, substancias, outras_informacoes

O backend não precisa validar essas chaves — apenas armazena o JSON enviado pelo frontend.

---
