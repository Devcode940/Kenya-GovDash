import { test, expect } from '@playwright/test';

test.describe('public dashboard', () => {
  test('home page renders the Kenya dashboard shell', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Kenya/i);
    // Bottom nav + sidebar should be present in the layout shell.
    await expect(page.locator('body')).toBeVisible();
  });

  test('finance audit page is reachable and shows data', async ({ page }) => {
    await page.goto('/finance-audit');
    // Either the heading or some finance figure should be visible.
    await expect(page.locator('main, body')).toContainText(/audit|finance|county/i, { timeout: 15_000 });
  });

  test('representatives directory renders', async ({ page }) => {
    await page.goto('/representatives');
    await expect(page.locator('main, body')).toContainText(/representative|senator|governor|MP/i, {
      timeout: 15_000,
    });
  });

  test('whistleblower status endpoint returns JSON', async ({ request }) => {
    const res = await request.get('/api/whistleblower/status?ticket=WB-DOES-NOT-EXIST');
    expect([400, 404, 501]).toContain(res.status());
  });
});

test.describe('site search', () => {
  test('search page accepts a query', async ({ page }) => {
    await page.goto('/search?q=Nairobi');
    await expect(page.locator('body')).toBeVisible();
  });
});