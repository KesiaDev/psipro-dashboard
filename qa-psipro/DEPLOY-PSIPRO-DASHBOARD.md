# Deploy do QA no repositório psipro-dashboard

Os secrets `AUTH_USER` e `AUTH_PASS` já foram criados em **KesiaDev/psipro-dashboard**.  
Agora é preciso enviar o código do QA (workflow + pasta qa-psipro) para esse repositório.

---

## Opção A: Push a partir do seu workspace (recomendado)

Execute no PowerShell, na pasta `novo-squad`:

```powershell
# 1. Clonar psipro-dashboard (se ainda não tiver)
cd c:\Users\User\Desktop
git clone https://github.com/KesiaDev/psipro-dashboard.git psipro-dashboard-qa
cd psipro-dashboard-qa

# 2. Criar pasta .github/workflows (se não existir)
New-Item -ItemType Directory -Force -Path .github\workflows

# 3. Copiar workflow e qa-psipro
Copy-Item -Recurse -Force ..\novo-squad\.github\workflows\qa.yml .github\workflows\
Copy-Item -Recurse -Force ..\novo-squad\qa-psipro .

# 4. Commit e push
git add .
git status
git commit -m "feat: adiciona QA Agent PsiPro (Playwright + schedule diário)"
git push origin main
```

> **Nota:** Se a branch principal for `master`, use `git push origin master`.

---

## Opção B: Se o psipro-dashboard já estiver clonado

```powershell
cd c:\Users\User\Desktop\psipro-dashboard   # ou onde está o clone
git pull origin main

# Copiar arquivos
Copy-Item -Recurse -Force ..\novo-squad\.github\workflows\qa.yml .github\workflows\qa.yml
Copy-Item -Recurse -Force ..\novo-squad\qa-psipro .\qa-psipro

git add .
git commit -m "feat: adiciona QA Agent PsiPro"
git push origin main
```

---

## Depois do push

1. Vá em **https://github.com/KesiaDev/psipro-dashboard/actions**
2. O workflow **PsiPro QA** deve aparecer
3. Rode manualmente: **Run workflow** → **Run workflow**
4. A partir daí roda em todo push em `main` e todo dia às 9h UTC (6h Brasília)

---

## Estrutura esperada no psipro-dashboard após o push

```
psipro-dashboard/
├── .github/
│   └── workflows/
│       └── qa.yml
├── qa-psipro/           # nova pasta
│   ├── tests/
│   ├── helpers/
│   ├── agents/
│   ├── package.json
│   └── ...
└── ... (dashboard, etc.)
```
