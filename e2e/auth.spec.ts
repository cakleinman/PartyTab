import { test, expect } from '@playwright/test';

test.describe('Authentication Page', () => {
    test('should display sign-in page', async ({ page }) => {
        await page.goto('/signin');

        // Page should load
        await expect(page).toHaveURL(/signin/);
    });

    test('should have email sign-in form', async ({ page }) => {
        await page.goto('/signin');

        // Look for email input
        const emailInput = page.getByPlaceholder(/email/i).or(
            page.getByLabel(/email/i)
        ).first();

        await expect(emailInput).toBeVisible();
    });

    test('should display OAuth provider buttons', async ({ page }) => {
        await page.goto('/signin');

        // Check for Google OAuth button
        const googleButton = page.getByRole('button', { name: /google/i }).or(
            page.locator('[aria-label*="Google"]')
        ).first();

        // Check for Apple OAuth button
        const appleButton = page.getByRole('button', { name: /apple/i }).or(
            page.locator('[aria-label*="Apple"]')
        ).first();

        // At least one OAuth provider should be visible
        const googleVisible = await googleButton.isVisible().catch(() => false);
        const appleVisible = await appleButton.isVisible().catch(() => false);

        expect(googleVisible || appleVisible).toBe(true);
    });
});
