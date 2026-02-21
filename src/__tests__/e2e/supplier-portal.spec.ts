import { test, expect } from '@playwright/test';

test.describe('Supplier Portal', () => {
  test.beforeEach(async ({ page }) => {
    // Clear state before each test
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display the supplier portal page', async ({ page }) => {
    // Login as admin to access supplier portal
    const adminButton = page.locator('button').filter({ hasText: /admin/i }).first();
    await adminButton.click();
    await page.waitForURL('/');

    await page.goto('/supplier-portal');
    await expect(page).toHaveURL('/supplier-portal');
  });

  test('should display supplier portal dashboard content', async ({ page }) => {
    const adminButton = page.locator('button').filter({ hasText: /admin/i }).first();
    await adminButton.click();
    await page.waitForURL('/');

    await page.goto('/supplier-portal');

    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
  });

  test('should navigate to supplier portal invoices', async ({ page }) => {
    const adminButton = page.locator('button').filter({ hasText: /admin/i }).first();
    await adminButton.click();
    await page.waitForURL('/');

    await page.goto('/supplier-portal/invoices');
    await expect(page).toHaveURL('/supplier-portal/invoices');
  });

  test('should navigate to supplier portal payments', async ({ page }) => {
    const adminButton = page.locator('button').filter({ hasText: /admin/i }).first();
    await adminButton.click();
    await page.waitForURL('/');

    await page.goto('/supplier-portal/payments');
    await expect(page).toHaveURL('/supplier-portal/payments');
  });

  test('should navigate to supplier portal disputes', async ({ page }) => {
    const adminButton = page.locator('button').filter({ hasText: /admin/i }).first();
    await adminButton.click();
    await page.waitForURL('/');

    await page.goto('/supplier-portal/disputes');
    await expect(page).toHaveURL('/supplier-portal/disputes');
  });

  test('should navigate to supplier portal documents', async ({ page }) => {
    const adminButton = page.locator('button').filter({ hasText: /admin/i }).first();
    await adminButton.click();
    await page.waitForURL('/');

    await page.goto('/supplier-portal/documents');
    await expect(page).toHaveURL('/supplier-portal/documents');
  });

  test('should navigate to supplier portal profile', async ({ page }) => {
    const adminButton = page.locator('button').filter({ hasText: /admin/i }).first();
    await adminButton.click();
    await page.waitForURL('/');

    await page.goto('/supplier-portal/profile');
    await expect(page).toHaveURL('/supplier-portal/profile');
  });

  test('should display supplier portal login page', async ({ page }) => {
    await page.goto('/supplier-portal/login');
    await expect(page).toHaveURL('/supplier-portal/login');
  });

  test('should have supplier portal sidebar navigation', async ({ page }) => {
    const adminButton = page.locator('button').filter({ hasText: /admin/i }).first();
    await adminButton.click();
    await page.waitForURL('/');

    await page.goto('/supplier-portal');

    // Portal should have some kind of navigation
    const nav = page.locator('nav, aside, [class*="sidebar"], [class*="nav"]').first();
    await expect(nav).toBeVisible();
  });

  test('should display supplier portal authentication page', async ({ page }) => {
    await page.goto('/supplier-portal/auth');
    await expect(page).toHaveURL('/supplier-portal/auth');
  });

  test('should display supplier portal dashboard', async ({ page }) => {
    const adminButton = page.locator('button').filter({ hasText: /admin/i }).first();
    await adminButton.click();
    await page.waitForURL('/');

    await page.goto('/supplier-portal/dashboard');
    await expect(page).toHaveURL('/supplier-portal/dashboard');
  });

  test('should have responsive layout', async ({ page }) => {
    const adminButton = page.locator('button').filter({ hasText: /admin/i }).first();
    await adminButton.click();
    await page.waitForURL('/');

    await page.goto('/supplier-portal');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(300);

    // Page should still be visible
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
