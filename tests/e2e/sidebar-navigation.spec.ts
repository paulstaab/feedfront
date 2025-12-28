import { expect, test } from './fixtures';
import { setupApiMocks } from './mocks';
import { ensureLoggedIn } from './auth';

const TEST_SERVER_URL = 'https://rss.example.com';
const TEST_USERNAME = 'testuser';
const TEST_PASSWORD = 'testpass';

test.describe('Sidebar Navigation (US1)', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page, TEST_SERVER_URL);
    // Navigate to login first, then clear storage on the app origin to avoid cross-origin access issues
    await page.goto('/login/');
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
  });

  test('switches between folders without page reload', async ({ page }) => {
    await ensureLoggedIn(page, {
      serverUrl: TEST_SERVER_URL,
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
    });

    // Check initial folder is selected (first with unread)
    const firstFolder = page.locator('[data-testid="folder-item"]').first();
    await expect(firstFolder).toHaveAttribute('data-selected', 'true');

    // Click on a different folder
    const secondFolder = page.locator('[data-testid="folder-item"]').nth(1);
    await secondFolder.click();

    // Verify URL doesn't change (no page reload)
    await expect(page).toHaveURL(/\/timeline/);

    // Verify main content updates to show selected folder's articles
    const articleList = page.locator('[data-testid="article-list"]');
    await expect(articleList).toBeVisible();

    // Verify selected folder is highlighted
    await expect(secondFolder).toHaveAttribute('data-selected', 'true');
    await expect(firstFolder).toHaveAttribute('data-selected', 'false');
  });

  test('automatically selects first folder with unread articles on load', async ({ page }) => {
    await ensureLoggedIn(page, {
      serverUrl: TEST_SERVER_URL,
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
    });

    // Wait for sidebar
    await page.waitForSelector('[data-testid="sidebar"]');

    // Wait for folder items to be rendered
    await page.waitForSelector('[data-testid="folder-item"]', { timeout: 15000 });

    // Wait for data to hydrate
    await page.waitForTimeout(1000);

    // First folder should be selected
    const firstFolder = page.locator('[data-testid="folder-item"]').first();
    await expect(firstFolder).toHaveAttribute('data-selected', 'true');

    // Articles from first folder should be displayed
    const articles = page.locator('[data-testid="article-item"]');
    await expect(articles.first()).toBeVisible();
  });

  test('preserves current folder view when marking individual articles as read', async ({
    page,
  }) => {
    await ensureLoggedIn(page, {
      serverUrl: TEST_SERVER_URL,
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
    });

    await page.waitForSelector('[data-testid="sidebar"]');

    // Wait for folder items to be rendered
    await page.waitForSelector('[data-testid="folder-item"]', { timeout: 15000 });

    // Wait for data to hydrate
    await page.waitForTimeout(1000);

    // Select a specific folder
    const targetFolder = page.locator('[data-testid="folder-item"]').nth(1);
    await targetFolder.click();

    // Verify folder is selected
    await expect(targetFolder).toHaveAttribute('data-selected', 'true');

    // Mark an individual article as read by clicking to expand it
    const firstArticle = page.locator('[data-testid="article-item"]').first();
    await firstArticle.click();

    // Wait a moment for the state to update
    await page.waitForTimeout(500);

    // Verify still on the same folder (folder should still be selected)
    await expect(targetFolder).toHaveAttribute('data-selected', 'true');
  });

  test('navigates to next folder when marking all articles in current folder as read', async ({
    page,
  }) => {
    await ensureLoggedIn(page, {
      serverUrl: TEST_SERVER_URL,
      username: TEST_USERNAME,
      password: TEST_PASSWORD,
    });

    await page.waitForSelector('[data-testid="sidebar"]');

    // Wait for folder items to be rendered
    await page.waitForSelector('[data-testid="folder-item"]', { timeout: 15000 });

    // Wait for data to hydrate
    await page.waitForTimeout(1000);

    // Get the count of folders before marking read
    const folderCount = await page.locator('[data-testid="folder-item"]').count();

    // Only run this test if there are at least 2 folders
    if (folderCount < 2) {
      test.skip();
      return;
    }

    // Select first folder (use force:true to bypass any overlapping elements)
    const firstFolder = page.locator('[data-testid="folder-item"]').first();
    const firstFolderName = await firstFolder.textContent();
    await firstFolder.click({ force: true });

    // Verify first folder is selected
    await expect(firstFolder).toHaveAttribute('data-selected', 'true');

    // Mark all articles as read
    const markAllReadButton = page.locator('[data-testid="mark-all-read-button"]');
    await expect(markAllReadButton).toBeVisible();
    await markAllReadButton.click();

    // Wait for navigation to complete
    await page.waitForTimeout(1000);

    // Should navigate to next folder with unread articles
    const currentlySelectedFolder = page.locator(
      '[data-testid="folder-item"][data-selected="true"]',
    );
    const newFolderName = await currentlySelectedFolder.textContent();

    // Verify we're on a different folder
    expect(newFolderName).not.toBe(firstFolderName);
  });
});
