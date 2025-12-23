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

test.describe('Sidebar Mobile Behavior (US3)', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page, TEST_SERVER_URL);
    await page.goto('/');
    await page.waitForURL(/\/login\//);
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test('opens and closes sidebar with hamburger button', async ({ page }) => {
    await completeLogin(page);

    // Sidebar should be hidden by default on mobile
    await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible();

    // Hamburger button should be visible
    const hamburger = page.locator('[data-testid="mobile-toggle"]');
    await expect(hamburger).toBeVisible();

    // Click hamburger to open sidebar
    await hamburger.click();

    // Sidebar should now be visible
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

    // Click hamburger again to close
    await hamburger.click();

    // Sidebar should be hidden
    await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible();
  });

  test('closes sidebar when tapping outside (overlay)', async ({ page }) => {
    await completeLogin(page);

    // Open sidebar
    await page.locator('[data-testid="mobile-toggle"]').click();
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

    // Wait for animation to complete
    await page.waitForTimeout(300);

    // Verify overlay is attached to DOM
    const overlay = page.locator('[data-testid="sidebar-overlay"]');
    await expect(overlay).toBeAttached();

    // Use dispatchEvent to trigger click on overlay - this ensures React event handler fires
    await overlay.dispatchEvent('click');

    // Sidebar should close
    await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible();
  });

  test('closes sidebar automatically after folder selection', async ({ page }) => {
    await completeLogin(page);

    // Open sidebar
    await page.locator('[data-testid="mobile-toggle"]').click();
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

    // Click on a folder - use force:true to bypass any overlapping elements during animation
    const folderItem = page.locator('[data-testid="folder-item"]').first();
    await folderItem.click({ force: true });

    // Sidebar should close automatically
    await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible();

    // Should still be on timeline page (no full reload)
    await expect(page).toHaveURL(/\/timeline/);
  });

  test('closes sidebar with Escape key', async ({ page }) => {
    await completeLogin(page);

    // Open sidebar
    await page.locator('[data-testid="mobile-toggle"]').click();
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Sidebar should close
    await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible();
  });
});
