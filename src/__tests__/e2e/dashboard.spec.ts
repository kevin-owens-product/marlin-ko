import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto('/login');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const adminButton = page.locator('button').filter({ hasText: /admin/i }).first();
    await adminButton.click();
    await page.waitForURL('/');
  });

  test('should display the dashboard with greeting', async ({ page }) => {
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should display KPI cards', async ({ page }) => {
    // Check for KPI values
    const kpiCards = page.locator('[class*="kpiCard"]');
    const count = await kpiCards.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('should display specific KPI values', async ({ page }) => {
    // Check for known KPI values from the dashboard data
    await expect(page.locator('text=94.9%')).toBeVisible();
    await expect(page.locator('text=847')).toBeVisible();
    await expect(page.locator('text=23')).toBeVisible();
  });

  test('should display processing pipeline', async ({ page }) => {
    // Look for pipeline stage names
    const pipelineSection = page.locator('text=Captured').first();
    await expect(pipelineSection).toBeVisible();
  });

  test('should display recent activity feed', async ({ page }) => {
    // Check for activity items
    const activityItems = page.locator('[class*="activityItem"]');
    const count = await activityItems.count();
    expect(count).toBeGreaterThanOrEqual(5);
  });

  test('should display agent performance section', async ({ page }) => {
    // Check for agent names
    await expect(page.locator('text=Capture Agent')).toBeVisible();
    await expect(page.locator('text=Classification Agent')).toBeVisible();
  });

  test('should display quick actions grid', async ({ page }) => {
    const quickActions = page.locator('[class*="quickAction"]');
    const count = await quickActions.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('should display the sidebar navigation', async ({ page }) => {
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();
  });

  test('should navigate to invoices page via sidebar', async ({ page }) => {
    // Click on invoices link in sidebar
    const invoicesLink = page.locator('a[href="/invoices"]');
    await invoicesLink.click();
    await expect(page).toHaveURL('/invoices');
  });

  test('should navigate to approvals page via sidebar', async ({ page }) => {
    const approvalsLink = page.locator('a[href="/approvals"]');
    await approvalsLink.click();
    await expect(page).toHaveURL('/approvals');
  });

  test('should display Medius logo in sidebar', async ({ page }) => {
    const logo = page.locator('[class*="logoIcon"]').first();
    await expect(logo).toBeVisible();
    await expect(logo).toContainText('M');
  });

  test('should show user info in sidebar', async ({ page }) => {
    const userSection = page.locator('[class*="userSection"]').first();
    await expect(userSection).toBeVisible();
  });

  test('should display CFO Command Center section', async ({ page }) => {
    await expect(page.locator('text=CFO Command Center')).toBeVisible();
    await expect(page.locator('text=Cash Position')).toBeVisible();
  });

  test('should display AI Strategic Recommendations', async ({ page }) => {
    await expect(page.locator('text=AI Strategic Recommendations')).toBeVisible();
  });

  test('should display Strategic Spend Intelligence', async ({ page }) => {
    await expect(page.locator('text=Strategic Spend Intelligence')).toBeVisible();
  });

  test('should display date and time in header', async ({ page }) => {
    const header = page.locator('[class*="headerDate"]');
    await expect(header).toBeVisible();
  });
});
