import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
    test('should load and display hero section', async ({ page }) => {
        await page.goto('/');

        // Page should load successfully
        await expect(page).toHaveTitle(/PartyTab/i);

        // Hero content should be visible
        const hero = page.locator('h1, [class*="hero"]').first();
        await expect(hero).toBeVisible();
    });

    test('should have call-to-action button', async ({ page }) => {
        await page.goto('/');

        // Look for CTA button — actual text is "Start a PartyTab"
        const cta = page.getByRole('link', { name: /start a partytab/i }).first();
        await expect(cta).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to sign-in page', async ({ page }) => {
        await page.goto('/');

        // Click sign-in link if available
        const signInLink = page.getByRole('link', { name: /sign in|log in/i }).first();
        if (await signInLink.isVisible()) {
            await signInLink.click();
            await expect(page).toHaveURL(/signin/);
        }
    });
});
