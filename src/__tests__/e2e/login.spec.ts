import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear auth state before each test
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display the login page with brand panel and form', async ({ page }) => {
    await page.goto('/login');

    // Brand panel elements
    await expect(page.locator('text=Medius')).toBeVisible();

    // Form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should display demo account buttons', async ({ page }) => {
    await page.goto('/login');

    // Check for demo login buttons
    const demoButtons = page.locator('button').filter({ hasText: /admin|approver|clerk|viewer/i });
    await expect(demoButtons.first()).toBeVisible();
  });

  test('should show error message for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Wait for error message to appear
    const errorMessage = page.locator('[class*="error"]');
    await expect(errorMessage).toBeVisible();
  });

  test('should login with demo admin account and redirect to dashboard', async ({ page }) => {
    await page.goto('/login');

    // Click the Admin demo button
    const adminButton = page.locator('button').filter({ hasText: /admin/i }).first();
    await adminButton.click();

    // Should redirect to dashboard
    await page.waitForURL('/');
    await expect(page).toHaveURL('/');
  });

  test('should login with demo approver account', async ({ page }) => {
    await page.goto('/login');

    const approverButton = page.locator('button').filter({ hasText: /approver/i }).first();
    await approverButton.click();

    await page.waitForURL('/');
    await expect(page).toHaveURL('/');
  });

  test('should login with email credentials for known demo user', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'sarah@medius.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    await page.waitForURL('/');
    await expect(page).toHaveURL('/');
  });

  test('should preserve login state on page reload', async ({ page }) => {
    await page.goto('/login');

    // Login with demo account
    const adminButton = page.locator('button').filter({ hasText: /admin/i }).first();
    await adminButton.click();

    await page.waitForURL('/');

    // Reload the page
    await page.reload();

    // Should still be on the dashboard, not redirected to login
    await expect(page).toHaveURL('/');
  });

  test('should have proper form labels for accessibility', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    // Check labels are associated with inputs
    const emailId = await emailInput.getAttribute('id');
    const passwordId = await passwordInput.getAttribute('id');

    if (emailId) {
      await expect(page.locator(`label[for="${emailId}"]`)).toBeVisible();
    }
    if (passwordId) {
      await expect(page.locator(`label[for="${passwordId}"]`)).toBeVisible();
    }
  });

  test('should display brand statistics', async ({ page }) => {
    await page.goto('/login');

    // Check for stat badges in the brand panel
    await expect(page.locator('text=94%')).toBeVisible();
    await expect(page.locator('text=2x')).toBeVisible();
    await expect(page.locator('text=$2.4M')).toBeVisible();
  });
});
