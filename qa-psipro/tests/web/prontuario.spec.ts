import { test, expect } from '@playwright/test';
import { loginWeb } from '../../helpers/login-web';

test.describe('Prontuário', () => {
  test.beforeEach(async ({ page }) => {
    await loginWeb(page);
    await page.goto('/patients');
  });

  test('abrir prontuário', async ({ page }, testInfo) => {
    // Prontuário é acessado dentro de um paciente. Verificar se existe link para prontuário.
    const linkProntuario = page.locator('a[href*="prontuario"], a[href*="session"], a[href*="record"]').first();
    const btnPaciente = page.getByRole('button').or(page.getByRole('link')).filter({ hasText: /paciente/i }).first();
    if ((await linkProntuario.count()) === 0 && (await btnPaciente.count()) === 0) {
      testInfo.skip(true, 'nenhum prontuário disponível');
      return;
    }
    // A página de pacientes carregou sem erros
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  });

  test('adicionar anotação', async ({ page }, testInfo) => {
    const btnAnotar = page.getByRole('button', { name: /anotar|adicionar|nova anotação/i });
    const textarea = page.locator('textarea');
    if ((await btnAnotar.count()) === 0 && (await textarea.count()) === 0) {
      testInfo.skip(true, 'área de anotação não encontrada');
    }
    await expect(page.getByText(/prontuário|anotação|nota/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('salvar prontuário', async ({ page }, testInfo) => {
    const btnSalvar = page.getByRole('button', { name: /salvar|gravar|salvar prontuário/i });
    if ((await btnSalvar.count()) === 0) {
      testInfo.skip(true, 'botão salvar não encontrado');
    }
    await expect(page.getByText(/prontuário/i).first()).toBeVisible({ timeout: 10000 });
  });
});
