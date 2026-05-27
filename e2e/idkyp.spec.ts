import { test, expect } from '@playwright/test';

test.describe('IDKYP', () => {
  test('renders the signed-out gate when not authenticated', async ({ page }) => {
    await page.goto('/idkyp', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: 'IDKYP' })).toBeVisible();
    await expect(page.getByRole('link', { name: /log in/i })).toBeVisible();
  });
});
