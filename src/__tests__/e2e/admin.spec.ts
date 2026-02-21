import { test, expect } from '@playwright/test';

test.describe('Admin Portal', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const adminButton = page.locator('button').filter({ hasText: /admin/i }).first();
    await adminButton.click();
    await page.waitForURL('/');
  });

  test('should navigate to admin portal', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL('/admin');
  });

  test('should display admin sidebar with navigation', async ({ page }) => {
    await page.goto('/admin');

    // Check for admin sidebar navigation items
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();
  });

  test('should display Super Admin badge', async ({ page }) => {
    await page.goto('/admin');

    await expect(page.locator('text=Super Admin').first()).toBeVisible();
  });

  test('should display admin dashboard content', async ({ page }) => {
    await page.goto('/admin');

    // Admin dashboard should have content visible
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();
  });

  test('should navigate to tenants page', async ({ page }) => {
    await page.goto('/admin');

    const tenantsLink = page.locator('a[href="/admin/tenants"]');
    await tenantsLink.click();
    await expect(page).toHaveURL('/admin/tenants');
  });

  test('should navigate to users page', async ({ page }) => {
    await page.goto('/admin');

    const usersLink = page.locator('a[href="/admin/users"]');
    await usersLink.click();
    await expect(page).toHaveURL('/admin/users');
  });

  test('should navigate to monitoring page', async ({ page }) => {
    await page.goto('/admin');

    const monitoringLink = page.locator('a[href="/admin/monitoring"]');
    await monitoringLink.click();
    await expect(page).toHaveURL('/admin/monitoring');
  });

  test('should navigate to feature flags page', async ({ page }) => {
    await page.goto('/admin');

    const flagsLink = page.locator('a[href="/admin/feature-flags"]');
    await flagsLink.click();
    await expect(page).toHaveURL('/admin/feature-flags');
  });

  test('should navigate to audit page', async ({ page }) => {
    await page.goto('/admin');

    const auditLink = page.locator('a[href="/admin/audit"]');
    await auditLink.click();
    await expect(page).toHaveURL('/admin/audit');
  });

  test('should have back to app link', async ({ page }) => {
    await page.goto('/admin');

    const backLink = page.locator('a[href="/"]').first();
    await expect(backLink).toBeVisible();
  });

  test('should navigate back to main app', async ({ page }) => {
    await page.goto('/admin');

    const backLink = page.locator('a[href="/"]').first();
    await backLink.click();
    await expect(page).toHaveURL('/');
  });

  test('should display Medius logo in admin sidebar', async ({ page }) => {
    await page.goto('/admin');

    const logoSection = page.locator('[class*="logoSection"]').first();
    await expect(logoSection).toBeVisible();
    await expect(logoSection).toContainText('Medius');
  });

  test('should display user avatar and name', async ({ page }) => {
    await page.goto('/admin');

    const userSection = page.locator('[class*="userSection"]').first();
    await expect(userSection).toBeVisible();
  });

  test('should highlight active navigation item', async ({ page }) => {
    await page.goto('/admin');

    const activeLink = page.locator('[class*="navLinkActive"]').first();
    await expect(activeLink).toBeVisible();
  });

  test('should deny access to non-admin users', async ({ page }) => {
    // Logout and login as viewer
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');

    const viewerButton = page.locator('button').filter({ hasText: /viewer/i }).first();
    await viewerButton.click();
    await page.waitForURL('/');

    // Try to access admin
    await page.goto('/admin');

    // Should see access denied or be redirected
    const accessDenied = page.locator('[class*="accessDenied"]');
    const isAccessDenied = await accessDenied.isVisible().catch(() => false);

    if (!isAccessDenied) {
      // May have been redirected to main app
      await expect(page).not.toHaveURL('/admin');
    }
  });
});
