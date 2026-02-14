import { test, expect } from '@playwright/test';

test.describe('Authentication Page', () => {
    test('should display sign-in page', async ({ page }) => {
        await page.goto('/signin', { waitUntil: 'networkidle' });

        // Wait for client-side hydration (page shows "Loading..." until /api/me resolves)
        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible({ timeout: 30000 });
    });

    test('should have display name input', async ({ page }) => {
        await page.goto('/signin', { waitUntil: 'networkidle' });

        // Wait for form to render after loading state
        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible({ timeout: 30000 });
        const nameInput = page.locator('input').first();
        await expect(nameInput).toBeVisible();
    });

    test('should have PIN input', async ({ page }) => {
        await page.goto('/signin', { waitUntil: 'networkidle' });

        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible({ timeout: 30000 });
        const pinInput = page.getByPlaceholder(/4 digits/i);
        await expect(pinInput).toBeVisible();
    });

    test('should have sign-in button', async ({ page }) => {
        await page.goto('/signin', { waitUntil: 'networkidle' });

        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible({ timeout: 30000 });
        const signInButton = page.getByRole('button', { name: /sign in/i });
        await expect(signInButton).toBeVisible();
    });

    test('should have link to create a tab', async ({ page }) => {
        await page.goto('/signin', { waitUntil: 'networkidle' });

        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible({ timeout: 30000 });
        const createTabLink = page.getByRole('link', { name: /create a tab/i });
        await expect(createTabLink).toBeVisible();
    });
});
