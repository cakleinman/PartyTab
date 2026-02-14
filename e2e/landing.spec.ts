import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
    test('should load and display hero section', async ({ page }) => {
        await page.goto('/', { waitUntil: 'networkidle' });

        // Page should load successfully
        await expect(page).toHaveTitle(/PartyTab/i);

        // Hero content should be visible
        const hero = page.locator('h1').first();
        await expect(hero).toBeVisible();
    });

    test('should have call-to-action', async ({ page }) => {
        await page.goto('/', { waitUntil: 'networkidle' });

        // Look for CTA — either the "Start Tab" submit button or the "Start a PartyTab" link
        const cta = page.locator('button[type="submit"], a[href="/tabs/new"]').first();
        await expect(cta).toBeVisible({ timeout: 15000 });
    });

    test('should navigate to sign-in page', async ({ page }) => {
        await page.goto('/', { waitUntil: 'networkidle' });

        // Click sign-in link if available
        const signInLink = page.getByRole('link', { name: /sign in|log in/i }).first();
        if (await signInLink.isVisible()) {
            await signInLink.click();
            await expect(page).toHaveURL(/signin/);
        }
    });
});
