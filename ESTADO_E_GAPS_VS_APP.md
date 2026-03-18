# Estado do Psipro-Dashboard e o que falta para ficar igual ao App Android

**Data:** Março 2025  
**Objetivo:** Alinhar o psipro-dashboard às funcionalidades do app Android.

---

## 1. RESUMO EXECUTIVO

| Aspecto | App Android | Psipro-Dashboard | Alinhado? |
|---------|-------------|------------------|-----------|
| **Trocar clínica** | Drawer + chip na Home | ClinicSelector no header | ✅ Sim |
| **Notificações** | Tela + badge com contador | Dropdown (estático, sem dados) | ⚠️ Parcial |
| **Suporte** | Tela (FAQ, Email, WhatsApp) | — | ❌ Falta |
| **Sincronizar** | Menu drawer (sync backend) | — | ❌ N/A (web não precisa) |
| **Plataforma Web** | Abre dashboard em Custom Tabs | É a própria plataforma | ✅ N/A |
| **Relatórios Web** | Abre relatórios web | Página /reports existe | ✅ Sim |
| **Configurações** | Tela completa | Tela com perfil, senha, notifs | ✅ Sim (integrado) |
| **Comando de voz** | VoiceCommandDialog | VoiceCommandButton | ✅ Sim |
| **Agenda** | CRUD completo + semana | Leitura + navegação quebrada | ⚠️ Parcial |
| **Pacientes** | CRUD + sessões | CRUD completo | ✅ Sim |
| **Sessões** | CRUD | Somente leitura | ⚠️ Parcial |
| **Financeiro** | — | CRUD completo | ✅ Sim (web tem mais) |

---

## 2. MENU APP vs DASHBOARD

### App Android (Drawer + BottomNav)
- **BottomNav:** Início, Agenda, Pacientes
- **Drawer:** Notificações, Plataforma Web, Relatórios Web, Sincronizar, Trocar clínica, Configurações, Suporte, Sair

### Psipro-Dashboard (Sidebar)
- Dashboard, Clínicas, Profissionais, Pacientes, Agenda, Sessões, Financeiro, Relatórios, Saúde do Sistema (admin), Configurações

---

## 3. O QUE JÁ ESTÁ IGUAL OU MELHOR

- **Login/ auth:** Backend NestJS (`POST /auth/login`, token, X-Clinic-Id)
- **Trocar clínica:** ClinicSelector no header (dropdown com todas as clínicas)
- **Pacientes:** CRUD completo + import Excel
- **Financeiro:** CRUD completo (app não tem)
- **Configurações:** Perfil (`/users/me`), senha (`/users/password`), acessibilidade, tema
- **Comando de voz:** VoiceCommandButton com comandos "nova sessão", "abrir agenda", "buscar paciente"

---

## 4. O QUE FALTA FAZER (para ficar igual ao app)

### 4.1 Funcionalidades específicas do app

| Item | Onde no app | O que fazer no dashboard |
|------|-------------|---------------------------|
| **Suporte** | Tela SuporteFragment | Criar página `/support` com FAQ, e-mail (apppsipro@gmail.com), WhatsApp (54992448888), feedback |
| **Notificações com dados** | Tela + badge | Integrar NotificationsDropdown com API de notificações (se existir) ou manter aviso "Configurar preferências" |
| **Sincronizar** | Botão no drawer | N/A para web — dados já vêm do backend em tempo real |

### 4.2 Botões e ações ainda não conectados (da auditoria)

| Tela | Botão/Ação | Endpoint esperado | Prioridade |
|------|------------|-------------------|------------|
| **Clínicas** | Nova Clínica | POST /clinics | Alta |
| **Clínicas** | Editar, Ver profissionais, Financeiro, Desativar | PUT, navegação, etc. | Média |
| **Profissionais** | Adicionar, Editar, Ver Agenda, Remover | POST/PUT/DELETE | Alta |
| **Agenda** | Novo Agendamento | POST /appointments | Alta |
| **Agenda** | Semana anterior / Hoje / Próxima semana | Corrigir refetch com datas | Alta |
| **Sessões** | Nova Sessão | POST /sessions | Alta |
| **Relatórios** | Exportar PDF | — | Média |
| **Configurações** | Horários, 2FA, Integrações | APIs específicas | Baixa |

### 4.3 Melhorias de UX para parecer com o app

- Adicionar **Suporte** no sidebar (entre Relatórios e Configurações)
- Garantir que **Notificações** no header mostre algo útil ou link para Configurações (já faz)

---

## 5. COMANDO ÚTIL PARA VERIFICAR O ESTADO

```bash
# No psipro-dashboard
npm run build
```

Se o build passar, o dashboard está funcional. Para desenvolvimento:

```bash
npm run dev
```

Certifique-se de que `VITE_API_URL` está configurada no `.env` apontando para o backend NestJS.

---

## 6. PRIORIDADES RECOMENDADAS

1. **Alta:** Nova Sessão, Novo Agendamento, corrigir navegação de semana na Agenda
2. **Alta:** Criar página Suporte (FAQ, e-mail, WhatsApp)
3. **Média:** Conectar ações de Clínicas e Profissionais
4. **Baixa:** Exportar PDF em Relatórios

---

## 7. ARQUIVOS-CHAVE

- **API:** `src/services/api.ts` — baseURL, token, X-Clinic-Id
- **Clínica:** `src/contexts/ClinicContext.tsx`, `ClinicSelector.tsx`
- **Perfil:** `src/hooks/useProfile.ts`, `src/pages/Settings.tsx`
- **Auditoria completa:** `AUDITORIA_BACKEND_PsIPRO_DASHBOARD.md`
