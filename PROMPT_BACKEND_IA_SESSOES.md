# Prompt: IA deve usar textos do psicólogo/terapeuta

O dashboard exibe análises geradas pela IA (resumo, temas, emoções, padrões). Essas análises precisam **incluir e considerar** tudo o que o psicólogo ou terapeuta escreve em texto.

## Textos que a IA deve usar como entrada

### 1. **Notas da sessão** (`session.notes`)
- O que o profissional anota em cada sessão.
- Disponível em: `GET /sessions/:id` → campo `notes`.
- Usar ao gerar: `aiAnalysis` (summary, themes, emotions, actionItems, riskFlags).

### 2. **Anamnese do paciente** (`patient.anamnesis`)
- História pessoal, queixa principal, motivo da consulta, hipótese/observação clínica, antecedentes, tratamentos, medicações, expectativas, etc.
- Disponível em: `GET /patients/:id` → campo `anamnesis` (ou `anamnesis_data`).
- Usar ao gerar: evolução (`/patients/:id/evolution`), padrões (`/patients/:id/patterns`), evolução emocional (`/patients/:id/emotional-evolution`).
- A anamnese fornece contexto clínico importante para a IA.

### 3. **Observações do paciente** (`patient.notes`)
- Observações gerais do profissional sobre o paciente.
- Disponível em: `GET /patients/:id` → campo `notes`.
- Usar em análises de evolução e padrões.

### 4. **Campos customizados da anamnese**
- Itens com `isCustom: true` que o profissional adiciona (ex.: "Rede de apoio", "Eventos estressores").
- Também devem ser considerados pela IA.

## O que implementar no backend

Ao chamar a IA (LLM ou serviço de análise):

1. **Sessão individual** (`/sessions/:id` → análise da sessão):
   - Incluir no prompt/contexto: `session.notes` (notas da sessão).
   - Opcional: `patient.anamnesis` e `patient.notes` para contexto do paciente.

2. **Evolução do paciente** (`/patients/:id/evolution`):
   - Incluir: `anamnesis` (todos os itens preenchidos), `patient.notes`.
   - Incluir: notas de todas as sessões do paciente.

3. **Padrões terapêuticos** (`/patients/:id/patterns`):
   - Mesma lógica: anamnese + notas do paciente + notas de todas as sessões.

4. **Evolução emocional** (`/patients/:id/emotional-evolution`):
   - Idem: considerar anamnese e notas em texto.

## Resumo

| Fonte | Onde está | Usar em |
|-------|-----------|---------|
| Notas da sessão | `session.notes` | Análise da sessão, evolução, padrões |
| Anamnese | `patient.anamnesis.items[].value` | Evolução, padrões, evolução emocional |
| Observações do paciente | `patient.notes` | Evolução, padrões |

A IA deve receber **todo o texto clínico** escrito pelo profissional para gerar análises mais precisas e contextualizadas.
