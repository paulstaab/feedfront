import { expect, test } from './fixtures';
import { setupApiMocks } from './mocks';
import { ensureLoggedIn } from './auth';

const TEST_SERVER_URL = 'https://rss.example.com';
const TEST_USERNAME = 'testuser';
const TEST_PASSWORD = 'testpass';

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
    await ensureLoggedIn(page, {
      serverUrl: TEST_SERVER_URL,
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
    });

    // Sidebar should be hidden by default on mobile
    await expect(page.locator('[data-testid="sidebar-mobile"]')).not.toBeVisible();

    // Hamburger button should be visible
    const hamburger = page.locator('[data-testid="mobile-toggle"]');
    await expect(hamburger).toBeVisible();

    // Click hamburger to open sidebar
    await hamburger.click();

    // Sidebar should now be visible
    await expect(page.locator('[data-testid="sidebar-mobile"]')).toBeVisible();

    // Click hamburger again to close
    await hamburger.click();

    // Sidebar should be hidden
    await expect(page.locator('[data-testid="sidebar-mobile"]')).not.toBeVisible();
  });

  test('closes sidebar when tapping outside (overlay)', async ({ page }) => {
    await ensureLoggedIn(page, {
      serverUrl: TEST_SERVER_URL,
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
    });

    // Open sidebar
    await page.locator('[data-testid="mobile-toggle"]').click();
    await expect(page.locator('[data-testid="sidebar-mobile"]')).toBeVisible();

    // Wait for animation to complete
    await page.waitForTimeout(300);

    // Verify overlay is attached to DOM
    const overlay = page.locator('[data-testid="sidebar-overlay"]');
    await expect(overlay).toBeAttached();

    // Use dispatchEvent to trigger click on overlay - this ensures React event handler fires
    await overlay.dispatchEvent('click');

    // Sidebar should close
    await expect(page.locator('[data-testid="sidebar-mobile"]')).not.toBeVisible();
  });

  test('closes sidebar automatically after folder selection', async ({ page }) => {
    await ensureLoggedIn(page, {
      serverUrl: TEST_SERVER_URL,
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
    });

    // Open sidebar
    await page.locator('[data-testid="mobile-toggle"]').click();
    await expect(page.locator('[data-testid="sidebar-mobile"]')).toBeVisible();

    // Wait a bit for animation to complete
    await page.waitForTimeout(500);

    // Click on a different folder (not the first/selected one) to trigger navigation
    // Use the folder items specifically within the mobile sidebar
    const mobileSidebar = page.locator('[data-testid="sidebar-mobile"]');
    const folderItems = mobileSidebar.locator('[data-testid="folder-item"]');
    const count = await folderItems.count();
    expect(count).toBeGreaterThan(1); // Ensure we have multiple folders
    const secondFolder = folderItems.nth(1);
    await secondFolder.click({ force: true });

    // Sidebar should close automatically
    await expect(page.locator('[data-testid="sidebar-mobile"]')).not.toBeVisible();

    // Should still be on timeline page (no full reload)
    await expect(page).toHaveURL(/\/timeline/);
  });

  test('closes sidebar with Escape key', async ({ page }) => {
    await ensureLoggedIn(page, {
      serverUrl: TEST_SERVER_URL,
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
    });

    // Open sidebar
    await page.locator('[data-testid="mobile-toggle"]').click();
    await expect(page.locator('[data-testid="sidebar-mobile"]')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Sidebar should close
    await expect(page.locator('[data-testid="sidebar-mobile"]')).not.toBeVisible();
  });
});
