import { test, expect } from '@playwright/test';
import { setupApiMocks } from '../e2e/mocks';
import { ensureLoggedIn } from '../e2e/auth';

const TEST_SERVER_URL = 'https://rss.example.com';
const TEST_USERNAME = 'testuser';
const TEST_PASSWORD = 'testpass';

const BREAKPOINTS = [
  { name: 'mobile', width: 320, height: 568 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1024, height: 768 },
];

test.describe('Visual: Timeline Folders', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page, TEST_SERVER_URL);
    await page.goto('/');
    await page.waitForURL(/\/login\//);
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
  });

  for (const breakpoint of BREAKPOINTS) {
    test(`should match baseline at ${breakpoint.name} (${String(breakpoint.width)}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
      await ensureLoggedIn(page, {
        serverUrl: TEST_SERVER_URL,
        username: TEST_USERNAME,
        password: TEST_PASSWORD,
      });

      // 1. Default Folder View (Header, Mark Read, Skip, Articles)
      await expect(page.getByTestId('active-folder-name')).toBeVisible();
      // Wait for articles to load
      await expect(page.getByText('Ship It Saturday: Folder Queue')).toBeVisible();

      await expect(page).toHaveScreenshot(`timeline-folder-default-${breakpoint.name}.png`, {
        fullPage: true,
        animations: 'disabled',
        mask: [page.getByTestId('active-folder-unread')], // Mask dynamic counts if needed, but they should be stable with mocks
      });
    });
  }

  test('all-read state visual', async ({ page }) => {
    // Mock empty items to show "All caught up"
    const apiBase = `${TEST_SERVER_URL}/index.php/apps/news/api/v1-3`;
    await page.route(`${apiBase}/items**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [] }),
      });
    });

    await page.setViewportSize({ width: 375, height: 667 }); // Mobile view for this state
    await ensureLoggedIn(page, {
      serverUrl: TEST_SERVER_URL,
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
    });

    await expect(page.getByRole('heading', { name: 'All caught up!' })).toBeVisible();

    await expect(page).toHaveScreenshot('timeline-all-caught-up-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
