import { test, expect } from '@playwright/test';

test.describe('Authentication Page', () => {
    test('should display sign-in page', async ({ page }) => {
        await page.goto('/signin');

        // Page should load with sign-in heading
        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    });

    test('should have display name input', async ({ page }) => {
        await page.goto('/signin');

        // Look for display name input (the actual field on the page)
        const nameInput = page.locator('input').first();
        await expect(nameInput).toBeVisible();
    });

    test('should have PIN input', async ({ page }) => {
        await page.goto('/signin');

        // Look for PIN input (password type with placeholder "4 digits")
        const pinInput = page.getByPlaceholder(/4 digits/i);
        await expect(pinInput).toBeVisible();
    });

    test('should have sign-in button', async ({ page }) => {
        await page.goto('/signin');

        // Sign in button should be visible
        const signInButton = page.getByRole('button', { name: /sign in/i });
        await expect(signInButton).toBeVisible();
    });

    test('should have link to create a tab', async ({ page }) => {
        await page.goto('/signin');

        // Link to create a tab should exist
        const createTabLink = page.getByRole('link', { name: /create a tab/i });
        await expect(createTabLink).toBeVisible();
    });
});
