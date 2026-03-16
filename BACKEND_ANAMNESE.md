# Anamnese — Integração Backend

A anamnese do paciente é exibida e editada na página de detalhe do paciente (`/patients/:id`).

## Estrutura de dados

```json
{
  "anamnesis": {
    "items": [
      {
        "key": "historia_pessoal",
        "label": "História pessoal",
        "value": "Texto preenchido pelo profissional...",
        "isCustom": false
      },
      {
        "key": "custom_1234567890",
        "label": "Rede de apoio",
        "value": "...",
        "isCustom": true
      }
    ],
    "updatedAt": "2025-03-11T12:00:00.000Z"
  }
}
```

## Endpoints

### GET `/patients/:id`

O backend deve retornar o paciente com o campo `anamnesis` (ou `anamnesis_data` / `anamnesisData`) quando existir.

### PATCH `/patients/:id`

O dashboard envia `anamnesis` no body ao salvar a anamnese:

```json
{
  "anamnesis": {
    "items": [...],
    "updatedAt": "..."
  }
}
```

O backend deve aceitar e persistir este campo (por exemplo, em uma coluna JSONB `anamnesis` na tabela de pacientes).

## Campos padrão

- História pessoal
- Queixa principal
- Motivo da consulta
- Hipótese / Observação clínica
- Antecedentes familiares
- Histórico de tratamentos anteriores
- Uso de medicações
- Funcionamento social e profissional
- Expectativas em relação à terapia
- Sono e alimentação
- Uso de álcool, tabaco ou outras substâncias
- Outras informações

O profissional pode adicionar campos personalizados ( `isCustom: true` ) com labels próprios.
