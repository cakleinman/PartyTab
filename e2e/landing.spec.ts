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

        // Look for CTA button (Get Started, Sign Up, etc.)
        const cta = page.getByRole('link', { name: /get started|sign up|try|start/i }).first();
        await expect(cta).toBeVisible();
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
