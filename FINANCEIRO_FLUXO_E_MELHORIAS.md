# Financeiro — Como funciona e melhorias

## Como funciona hoje

### 1. Registro de sessão vs. cobrança

**São processos separados:**

| Etapa | Onde | O que acontece |
|-------|------|----------------|
| **Agendar/Criar sessão** | Agenda ou Sessões | Cria a sessão (data, paciente, profissional). Não gera cobrança. |
| **Realizar a sessão** | Sessões | Sessão marcada como "realizada". Ainda não gera cobrança. |
| **Registrar cobrança** | Financeiro → Novo Registro | Você preenche manualmente: paciente, valor, descrição, forma de pagamento, status. |

Ou seja: **não há vínculo automático entre sessão e cobrança**. A cobrança é sempre manual.

### 2. Como registrar uma cobrança de sessão

1. Ir em **Financeiro**
2. Clicar em **+ Novo Registro**
3. Preencher:
   - **Tipo**: Receita
   - **Categoria**: Sessão (ou Avaliação, Pacote, etc.)
   - **Paciente**: selecionar o paciente (opcional)
   - **Descrição**: ex.: "Sessão individual - João Silva"
   - **Valor (R$)**: valor cobrado
   - **Forma de pagamento**: PIX, Dinheiro, Cartão, etc.
   - **Status**: Pago ou Pendente
   - **Vencimento**: data de vencimento (se pendente)

### 3. O que os cards mostram

- **Receita Total**: soma das receitas com status "Pago"
- **Despesas**: soma das despesas com status "Pago"
- **Lucro Líquido**: Receita − Despesas
- **Pendente**: soma dos valores com status "Pendente"

---

## Melhorias sugeridas

### Prioridade alta

1. **"Registrar cobrança" a partir da sessão**
   - Na lista de Sessões ou na página de detalhe da sessão, botão **"Registrar cobrança"**
   - Abre o modal de novo registro já preenchido com:
     - Paciente
     - Categoria: Sessão
     - Descrição: "Sessão - [nome do paciente] - [data]"
   - Reduz trabalho manual e evita esquecer de cobrar

2. **Valor padrão por tipo de sessão**
   - Configuração (ex.: em Clínicas ou Configurações): valor padrão para Consulta, Avaliação, Pacote
   - Ao registrar cobrança a partir da sessão, o valor vem preenchido automaticamente

3. **Vínculo sessão ↔ registro financeiro**
   - Backend: campo `session_id` em `financial_records`
   - Ao criar cobrança a partir da sessão, salvar o `session_id`
   - Permite:
     - Ver se a sessão já foi cobrada
     - Evitar cobranças duplicadas
     - Relatórios (sessões cobradas vs. não cobradas)

### Prioridade média

4. **Filtros na lista de registros**
   - Por período (data início/fim)
   - Por paciente
   - Por categoria
   - Por status (Pago, Pendente, Atrasado)

5. **Gráficos**
   - Receita por mês
   - Despesas por categoria
   - Evolução do lucro

6. **Indicador de cobrança na sessão**
   - Na lista de Sessões, ícone ou badge indicando se a sessão já tem cobrança registrada

### Prioridade baixa

7. **Lembretes de vencimento**
   - Notificação ou aviso para cobranças pendentes/atrasadas

8. **Exportar**
   - Exportar registros para PDF ou Excel (contabilidade)

9. **Pacotes/planos**
   - Pacote de X sessões com valor único
   - Controle de sessões utilizadas do pacote

---

## Resumo do fluxo ideal (após melhorias)

```
Sessão realizada → Botão "Registrar cobrança" → Modal abre com dados preenchidos
→ Usuário confirma/ajusta valor e forma de pagamento → Salva
→ Registro financeiro vinculado à sessão (session_id)
→ Na lista de Sessões, indicador mostra se já foi cobrada
```

---

## Backend necessário

Para as melhorias de vínculo sessão ↔ cobrança:

- **POST /financial/records**: aceitar `sessionId` (opcional) no body
- **GET /financial/records**: retornar `session_id` quando existir
- **GET /sessions/:id**: retornar se existe cobrança vinculada (ou endpoint separado)
