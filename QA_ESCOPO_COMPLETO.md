# PsiPro Dashboard – Escopo Completo para QA Agent

Documento de referência para testes automatizados ou manuais. Contém tudo que a plataforma oferece.

---

## 1. Rotas e Páginas

| URL | Página | Proteção | Gate |
|-----|--------|----------|------|
| `/login` | Login | Pública | - |
| `/register` | Registro | Pública | - |
| `/forgot-password` | Esqueci a senha | Pública | - |
| `/reset-password` | Redefinir senha | Pública | - |
| `/` | Dashboard (Index) | Protegida | ClinicGate |
| `/clinics` | Clínicas | Protegida | ClinicGate |
| `/psychologists` | Profissionais | Protegida | ClinicGate |
| `/financials` | Financeiro | Protegida | ClinicGate |
| `/patients` | Pacientes | Protegida | ClinicGate |
| `/patients/:id` | Detalhe do Paciente | Protegida | ClinicGate |
| `/calendar` | Agenda | Protegida | ClinicGate |
| `/sessions` | Sessões | Protegida | ClinicGate |
| `/sessions/:id` | Detalhe da Sessão | Protegida | ClinicGate |
| `/reports` | Relatórios | Protegida | ClinicGate |
| `/settings` | Configurações | Protegida | ClinicGate |
| `/settings/integrations` | Configurações (tab Integrações) | Protegida | ClinicGate |
| `/system-health` | Saúde do Sistema | Protegida | ClinicGate + **AdminRoute** |
| `*` (qualquer outra) | 404 NotFound | Pública | - |

**AdminRoute:** Apenas `userRole === "admin"` ou `"owner"` acessa. Psicólogo é redirecionado para `/`.

---

## 2. Fluxos de Autenticação

### Login (`/login`)
- Campos: email, senha
- Botão mostrar/ocultar senha
- Link "Esqueci a senha" → `/forgot-password`
- Link para registro → `/register`
- **Handoff (app):** `?token=...&returnUrl=...` → auto-login e redirect
- Estados: loading ("Entrando..."), toast de erro

### Registro (`/register`)
- Campos: nome, sobrenome, tipo profissional (select), CRP, email, senha
- Validação: senha mínimo 8 caracteres
- Links para Termos e Privacidade (não funcionais)
- Link para login

### Esqueci a Senha (`/forgot-password`)
- Campo: email
- Mensagem de sucesso "E-mail Enviado"
- Link para voltar ao login

### Redefinir Senha (`/reset-password`)
- Campos: nova senha, confirmar senha
- Validação: coincidência, mínimo 8 caracteres

---

## 3. Dashboard (`/`)

- **Cards de estatísticas:** Pacientes Ativos, Consultas Hoje, Taxa de Retorno, Horas Atendidas
- **Lista de consultas do dia**
- **Mini calendário** (dias com agendamentos destacados)
- **Pacientes recentes** (links para detalhe)
- Estados de loading e erro com retry

---

## 4. Clínicas (`/clinics`)

- **Cards resumo:** Unidades Ativas, Profissionais, Pacientes Total
- **Lista de clínicas** (cards: nome, endereço, telefone, email, nº profissionais, nº pacientes, status)
- **Criar clínica** (owner) → `ClinicFormDialog`
- **Editar clínica** (dropdown no card)
- **Desativar clínica** (dropdown → AlertDialog de confirmação)
- Botão "Ver profissionais" → navega para `/psychologists`
- **CreateFirstClinicModal** (quando não há clínicas, não pode fechar)

---

## 5. Profissionais (`/psychologists`)

- **Lista de profissionais** (nome, email, tipo, CRP, status)
- **Adicionar profissional** → `ProfessionalFormDialog`
- **Editar profissional** → `EditSessionDialog` / modal equivalente
- **Remover profissional** → AlertDialog
- Filtro por clínica (selector no header)

---

## 6. Pacientes (`/patients`)

- **Busca** por nome ou telefone
- **Filtros:** Todos, Ativos, Novos, Inativos
- **Adicionar paciente** → `AddPatientDialog`
- **Importar Excel** → `ImportPatientsModal` (barra de progresso)
- **Seleção em massa** (checkboxes)
- **Excluir em massa** (selecionados ou todos)
- **Excluir individual** (dropdown → AlertDialog)
- **Editar paciente** → `EditPatientModal`
- **Ações por linha:** Ver paciente, Editar, Ver sessões, Excluir
- Clique na linha → detalhe do paciente

---

## 7. Detalhe do Paciente (`/patients/:id`)

- Cabeçalho: nome, status, badge
- Informações de contato e demográficas
- **Gráfico de evolução** (API evolution)
- **Linha do tempo emocional**
- **Nuvem de frequência de emoções**
- Indicadores de tendência emocional
- Lista de sessões
- **Insights de padrões**
- Link para sessões

---

## 8. Agenda (`/calendar`)

- Vista semanal (7 dias × 16 horas)
- Navegação: semana anterior, próxima, "Hoje"
- **Adicionar agendamento** → `AddAppointmentDialog`
- Agendamentos por dia/hora (cores: confirmado, pendente, concluído)
- Cards resumo: Consultas Hoje, Confirmadas, Pendentes

---

## 9. Sessões (`/sessions`)

- **Busca** por nome do paciente
- **Filtros:** Todas, Concluída, Agendada, Em andamento, Cancelada
- Suporte a `?patientId=` na URL
- **Criar sessão** → `CreateSessionDialog`
- Sessões agrupadas por data
- **Ações:** Editar, Excluir
- Clique na linha → detalhe da sessão
- **Comando de voz:** "nova sessão" abre o modal (requer suporte do navegador)

---

## 10. Detalhe da Sessão (`/sessions/:id`)

- Dados: paciente, profissional, data, hora, notas, status
- Botão Editar → `EditSessionDialog`
- Botão Voltar

---

## 11. Relatórios (`/reports`)

- **Estatísticas:** Total Sessões, Pacientes Ativos, Taxa de Retorno, Média por Semana
- **Gráficos:** Sessões mensais (barras), Receita (linha), Tipos de sessão (pizza), Top pacientes (barras)
- **Exportar PDF**

---

## 12. Financeiro (`/financials`)

- **Restrição de role:** Psicólogo vê "Acesso Restrito"
- **KPIs:** Receita Total, Despesas, Lucro Líquido, Pendente
- **Adicionar registro** → `AddFinancialRecordDialog` (tipo, categoria, paciente, valor, método de pagamento, status)
- Tabela de registros (editar/excluir inline)

---

## 13. Configurações (`/settings`)

### Tabs

| Tab | Funcionalidades |
|-----|-----------------|
| **Perfil** | Nome, tipo profissional, CRP, email, telefone, especialidades, avatar (botão), Salvar |
| **Horários** | Dias da semana, toggles, horários início/fim (Salvar desabilitado "Em breve") |
| **Notificações** | Toggles: email, push, SMS, lembretes |
| **Segurança** | Senha atual, nova, confirmar; 2FA (desabilitado) |
| **Integrações** | PsiPro App (deeplink), Google Calendar (Conectar/Desconectar), WhatsApp/Pagamento (Em breve) |
| **Aparência** | Toggle claro/escuro, seletor de paleta |
| **Acessibilidade** | Alto contraste, fonte ampliada, espaçamento de texto, botões maiores |

### Integrações
- **PsiPro App:** Botão "Abrir no app" (deeplink `psipro://open`)
- **Google Calendar:** Conectar (OAuth), Desconectar, status "Conectado"
- **WhatsApp Business / Gateway de Pagamento:** "Em breve"

---

## 14. Saúde do Sistema (`/system-health`)

- Apenas admin/owner
- **Checks:** Backend API, Database, Mobile Sync, Web Sync
- Status geral: Operacional / Degradado / Indisponível
- Latência média
- Botão Atualizar

---

## 15. Layout e Navegação

### DashboardLayout
- Sidebar (colapsável)
- Header: título, botão sidebar, comando de voz, seletor de clínica, toggle tema, busca, notificações
- Skip link: "Pular para o conteúdo principal"
- **Modais condicionais:** CreateFirstClinicModal, WorkspaceSelectionModal

### AppSidebar
- Logo PsiPro
- Links: Dashboard, Clínicas, Profissionais, Pacientes, Agenda, Sessões, Financeiro, Relatórios
- Saúde do Sistema (só admin/owner)
- Configurações
- Área de perfil (avatar, nome, role) → /settings
- Logout

### ClinicSelector
- Quando múltiplas clínicas: dropdown para escolher
- Header `X-Clinic-Id` em todas as requisições

### Comandos de voz (VoiceCommandButton)
- "nova sessão", "agenda", "buscar paciente", "dashboard"
- Requer suporte a Web Speech API no navegador

---

## 16. Endpoints da API

**Base:** `VITE_API_URL` (ex: `https://psipro-backend-production.up.railway.app`)  
**Headers:** `Authorization: Bearer <token>`, `X-Clinic-Id: <clinicId>`

### Auth
| Método | Endpoint |
|--------|----------|
| POST | `/auth/login` |
| POST | `/auth/register` |
| POST | `/auth/forgot-password` |
| POST | `/auth/update-password` |
| POST | `/auth/handoff` |

### Clínicas
| Método | Endpoint |
|--------|----------|
| GET | `/clinics` |
| POST | `/clinics` |
| PUT | `/clinics/:id` |
| PATCH | `/clinics/:id/status` |

### Pacientes
| Método | Endpoint |
|--------|----------|
| GET | `/patients` |
| GET | `/patients/recent` |
| GET | `/patients/:id` |
| POST | `/patients` |
| PATCH | `/patients/:id` |
| DELETE | `/patients/:id` |
| POST | `/patients/import` (FormData) |
| GET | `/patients/:id/evolution` |
| GET | `/patients/:id/patterns` |
| GET | `/patients/:id/emotional-evolution` |

### Agendamentos
| Método | Endpoint |
|--------|----------|
| GET | `/appointments` (?start, ?end) |
| GET | `/appointments/today` |
| POST | `/appointments` |

### Sessões
| Método | Endpoint |
|--------|----------|
| GET | `/sessions` |
| GET | `/sessions/:id` |
| POST | `/sessions` |
| PATCH | `/sessions/:id` |
| DELETE | `/sessions/:id` |

### Profissionais
| Método | Endpoint |
|--------|----------|
| GET | `/professionals` (?clinicId=) |
| POST | `/professionals` |
| PUT | `/professionals/:id` |
| DELETE | `/professionals/:id` |

### Financeiro
| Método | Endpoint |
|--------|----------|
| GET | `/financial/records` |
| GET | `/financial/summary` |
| POST | `/financial/records` |
| PATCH | `/financial/records/:id` |
| DELETE | `/financial/records/:id` |

### Dashboard / Stats
| Método | Endpoint |
|--------|----------|
| GET | `/patients/count` |
| GET | `/appointments/today` |
| GET | `/sessions/stats` |
| GET | `/financial/summary` |

### Usuário / Perfil
| Método | Endpoint |
|--------|----------|
| GET | `/users/me` |
| PUT | `/users/me` |
| PUT | `/users/password` |

### Relatórios
| Método | Endpoint |
|--------|----------|
| GET | `/reports` |

### Integrações
| Método | Endpoint |
|--------|----------|
| GET | `/integrations/google-calendar/status` |
| GET | `/integrations/google-calendar/connect` |
| POST | `/integrations/google-calendar/disconnect` |

---

## 17. Estados de Erro e Loading

- **ErrorState:** ícone, título, mensagem; 401 → link para login; outros → "Tentar novamente"
- **LoadingSkeleton:** variantes `page`, `list`
- **401:** limpa token, user, clinicId; dispara `psipro:auth:401`; redirect para login
- Toasts (Sonner): sucesso/erro em ações (criar, editar, excluir, etc.)

---

## 18. Acessibilidade

- `AccessibilityProvider`: highContrast, enlargedFont, textSpacing, largeButtons
- Classes aplicadas: `high-contrast`, `large-font`, `a11y-text-spacing`, `large-buttons`
- Skip link para conteúdo principal
- `aria-label` em controles principais
- `sr-only` onde necessário

---

## 19. Fluxos Críticos para Testar

1. **Registro → Login → Primeira clínica / seleção de workspace**
2. **Login com handoff** (`?token=...&returnUrl=...`)
3. **CRUD de pacientes** (incl. import Excel, exclusão em massa)
4. **CRUD de sessões**
5. **CRUD de agendamentos** (calendário)
6. **CRUD de clínicas**
7. **CRUD de profissionais**
8. **Financeiro** (adicionar registro; verificar bloqueio para psicólogo)
9. **Configurações:** perfil, senha, Google Calendar
10. **Admin:** Saúde do Sistema só para admin/owner
11. **401:** logout e redirect
12. **404:** página NotFound e link para home
13. **Múltiplas clínicas:** seletor, X-Clinic-Id em todas as requisições

---

## 20. Arquivos Principais

| Área | Arquivo |
|-----|---------|
| Rotas | `src/App.tsx` |
| Layout | `src/components/DashboardLayout.tsx` |
| Sidebar | `src/components/AppSidebar.tsx` |
| Auth | `src/contexts/AuthContext.tsx` |
| Clínicas | `src/contexts/ClinicContext.tsx` |
| API | `src/services/api.ts` |
| Guards | `src/components/ProtectedRoute.tsx`, `ClinicGate.tsx`, `AdminRoute.tsx` |
| Páginas | `src/pages/*.tsx` |
| Hooks | `src/hooks/*.ts` |

---

*Documento gerado para uso por agente de QA. Atualize conforme novas funcionalidades forem adicionadas.*
