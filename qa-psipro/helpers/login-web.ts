import { Page } from '@playwright/test';

const EMAIL = process.env.AUTH_USER || 'terapeutaclaudiacruz@gmail.com';
const PASSWORD = process.env.AUTH_PASS || 'senha123';

/**
 * Login reutilizável no app web.
 * Evita repetir fluxo de login em todos os testes.
 */
export async function loginWeb(page: Page): Promise<void> {
  await page.goto('/login');

  await page.fill('input[name=email], input[type=email]', EMAIL);
  await page.fill('input[name=password], input[type=password]', PASSWORD);

  await page.click('button[type=submit], button:has-text("Entrar")');

  await page.waitForURL((url) => !url.pathname.match(/\/login\/?$/), { timeout: 30000 });

  // Dispensar modal de seleção de clínica se aparecer
  const modal = page.locator('dialog, [role="dialog"]').filter({ hasText: 'Como deseja acessar?' });
  if (await modal.isVisible({ timeout: 3000 }).catch(() => false)) {
    await page.click('dialog button:has-text("Entrar"), [role="dialog"] button:has-text("Entrar")');
    await modal.waitFor({ state: 'detached', timeout: 8000 }).catch(() => {});
  }
  // Aguardar backdrop/overlay sair completamente (animação de saída)
  await page.locator('[aria-hidden="true"].bg-black\\/80, [data-state="open"][aria-hidden="true"]')
    .waitFor({ state: 'detached', timeout: 5000 })
    .catch(() => {});
}
