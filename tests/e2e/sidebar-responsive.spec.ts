import { type Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { setupApiMocks } from './mocks';

const TEST_SERVER_URL = 'https://rss.example.com';
const TEST_USERNAME = 'testuser';
const TEST_PASSWORD = 'testpass';

async function completeLogin(page: Page) {
  await page.goto('/login/');
  await page.waitForLoadState('networkidle');
  await page.getByLabel(/server url/i).fill(TEST_SERVER_URL);
  await page.getByRole('button', { name: /^continue$/i }).click();
  await expect(page.getByLabel(/username/i)).toBeVisible({ timeout: 10_000 });
  await page.getByLabel(/username/i).fill(TEST_USERNAME);
  await page.getByLabel(/password/i).fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /log.*in|sign.*in/i }).click();
  await page.waitForURL(/\/timeline/, { timeout: 10_000 });
}

test.describe('Sidebar Responsive Behavior (US3)', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page, TEST_SERVER_URL);
    await page.goto('/');
    await page.waitForURL(/\/login\//);
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
  });

  test('sidebar is always visible on desktop (>=768px)', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1024, height: 768 });

    await completeLogin(page);

    // Sidebar should be visible
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

    // Hamburger button should be hidden
    await expect(page.locator('[data-testid="mobile-toggle"]')).not.toBeVisible();
  });

  test('sidebar is hidden by default on mobile (<768px)', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await completeLogin(page);

    // Sidebar should be hidden
    await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible();

    // Hamburger button should be visible
    await expect(page.locator('[data-testid="mobile-toggle"]')).toBeVisible();
  });

  test('sidebar transitions correctly when resizing from mobile to desktop', async ({ page }) => {
    // Start on mobile
    await page.setViewportSize({ width: 375, height: 667 });

    await completeLogin(page);

    // Sidebar hidden, hamburger visible
    await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="mobile-toggle"]')).toBeVisible();

    // Open sidebar on mobile
    await page.locator('[data-testid="mobile-toggle"]').click();
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

    // Resize to desktop
    await page.setViewportSize({ width: 1024, height: 768 });

    // Sidebar should remain visible (ignoring isOpen state)
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

    // Hamburger should be hidden
    await expect(page.locator('[data-testid="mobile-toggle"]')).not.toBeVisible();
  });

  test('sidebar transitions correctly when resizing from desktop to mobile', async ({ page }) => {
    // Start on desktop
    await page.setViewportSize({ width: 1024, height: 768 });

    await completeLogin(page);

    // Sidebar visible, hamburger hidden
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-toggle"]')).not.toBeVisible();

    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Sidebar should be hidden (respects isOpen=false default)
    await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible();

    // Hamburger should be visible
    await expect(page.locator('[data-testid="mobile-toggle"]')).toBeVisible();
  });

  test('tablet behavior (768-1024px) matches desktop', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await completeLogin(page);

    // Sidebar should be visible
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

    // Hamburger button should be hidden
    await expect(page.locator('[data-testid="mobile-toggle"]')).not.toBeVisible();
  });
});
