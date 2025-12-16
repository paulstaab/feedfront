import { type Page } from '@playwright/test';
import { expect, test } from './fixtures';
import { mockFolders, setupApiMocks } from './mocks';

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

test.describe.skip('Timeline folders (US1)', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page, TEST_SERVER_URL);
    await page.goto('/');
    await page.waitForURL(/\/login\//);
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });
  });

  test('logs in and lands on folder-first timeline', async ({ page }) => {
    await completeLogin(page);
    await expect(page).toHaveURL(/\/timeline/);
    await expect(page.getByRole('heading', { name: /timeline/i })).toBeVisible();
  });

  test('shows the highest-priority folder header by default', async ({ page }) => {
    await completeLogin(page);
    const topFolderName = mockFolders[0]?.name ?? 'Engineering Updates';
    await expect(page.getByRole('heading', { name: new RegExp(topFolderName, 'i') })).toBeVisible();
    await expect(page.getByText(/mark all as read/i)).toBeVisible();
  });
});
