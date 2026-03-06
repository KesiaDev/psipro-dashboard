# Acessibilidade (A11y) — PsiPro Web

Este documento descreve as implementações de acessibilidade do PsiPro Dashboard para compatibilidade com leitores de tela (NVDA, VoiceOver, JAWS) e navegação por teclado.

## 1. Atributos ARIA

- **Botões**: `aria-label` em ícones e ações (ex.: "Adicionar novo paciente", "Voltar para lista de sessões")
- **Inputs**: `htmlFor` + `id` nas labels, `aria-required`, `aria-label` em campos obrigatórios
- **Regiões**: `role="region"`, `aria-labelledby` em seções (Consultas de Hoje, Pacientes Recentes, Análise da IA)
- **Navegação**: `role="navigation"`, `aria-label="Menu principal"` na sidebar

## 2. Navegação por teclado

- **Sessões** (`/sessions`): Cards são focáveis (Tab), Enter/Space para abrir detalhes
- **Pacientes** (`/patients`): Área do paciente é focável, Enter/Space para ver detalhes
- **Pacientes recentes** (Dashboard): Itens são focáveis quando `id` existe
- **Detalhe do paciente**: Lista de sessões é focável, Enter/Space para abrir
- **Menu lateral**: Perfil e logout são focáveis
- **Link de pular**: "Pular para o conteúdo principal" visível no foco (Tab inicial)

## 3. Gráficos (Recharts)

- **Emoções por sessão** (PatientDetail): Tabela alternativa invisível (`sr-only`) com dados para leitores de tela
- Gráfico SVG marcado com `aria-hidden="true"` (a tabela fornece os dados)

## 4. Configurações de acessibilidade

Em **Configurações > Acessibilidade**:

| Opção | Descrição |
|-------|-----------|
| **Alto contraste** | Contraste WCAG 2.1 nível AA |
| **Fonte ampliada** | Aumenta tamanhos de texto |
| **Espaçamento de texto** | `letter-spacing`, `word-spacing`, `line-height` |

As preferências são salvas em `localStorage` e aplicadas via classes em `html`.

## 5. Anúncios (aria-live)

- **Análise da IA** (SessionDetail): `aria-live="polite"` na região da análise para leitores de tela

## 6. Estrutura semântica

- `<header role="banner">` no topo
- `<nav role="navigation">` na sidebar
- `<main id="main-content" role="main">` para o conteúdo principal
- `<section>` e `<article>` onde apropriado

## 7. Teste recomendado

1. **Lighthouse** (Chrome DevTools): Auditoria de Acessibilidade
2. **NVDA** (Windows): `Ctrl+Alt+N` para iniciar
3. **VoiceOver** (macOS): `Cmd+F5`
4. **JAWS**: Instalação separada no Windows
5. **Navegação por teclado**: Tab, Shift+Tab, Enter, Space em toda a interface
