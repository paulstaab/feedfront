import { test as base, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { setupApiMocks } from '../mocks';

/**
 * Accessibility tests for sidebar components.
 * Validates WCAG 2.1 AA compliance for color contrast and keyboard navigation.
 */

const test = base.extend<{ makeAxeBuilder: () => AxeBuilder }>({
  makeAxeBuilder: async ({ page }, fixtureUse) => {
    const createAxeBuilder = () => new AxeBuilder({ page });
    await fixtureUse(createAxeBuilder);
  },
});

const TEST_SERVER_URL = 'https://rss.example.com';
const TEST_USERNAME = 'testuser';
const TEST_PASSWORD = 'testpass';

async function loginUser(page: Page) {
  await page.goto('/login/');
  await page.waitForLoadState('domcontentloaded');

  await page.getByLabel(/server url/i).fill(TEST_SERVER_URL);
  await page.getByRole('button', { name: /^continue$/i }).click();
  await page.waitForTimeout(500);

  await page.getByLabel(/username/i).fill(TEST_USERNAME);
  await page.getByLabel(/password/i).fill(TEST_PASSWORD);
  await page.getByRole('button', { name: /login|sign in/i }).click();

  await page.waitForURL(/\/timeline/);
  await page.waitForLoadState('networkidle');
}

test.describe('Sidebar Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await setupApiMocks(page);
  });

  test.describe('Color Contrast', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('sidebar meets WCAG 2.1 AA color contrast requirements', async ({
      page,
      makeAxeBuilder,
    }) => {
      await loginUser(page);
      await page.waitForSelector('[data-testid="sidebar"]');

      // Run axe specifically on sidebar
      const accessibilityScanResults = await makeAxeBuilder()
        .include('[data-testid="sidebar"]')
        .withTags(['wcag2aa', 'wcag21aa'])
        .analyze();

      // Filter for color contrast violations
      const contrastViolations = accessibilityScanResults.violations.filter(
        (v) => v.id === 'color-contrast' || v.id === 'color-contrast-enhanced',
      );

      expect(contrastViolations).toEqual([]);
    });

    test('timeline content meets color contrast requirements', async ({ page, makeAxeBuilder }) => {
      await loginUser(page);
      await page.waitForSelector('[data-testid="article-list"]', { timeout: 10000 });

      const accessibilityScanResults = await makeAxeBuilder()
        .include('main')
        .withTags(['wcag2aa', 'wcag21aa'])
        .analyze();

      const contrastViolations = accessibilityScanResults.violations.filter(
        (v) => v.id === 'color-contrast' || v.id === 'color-contrast-enhanced',
      );

      expect(contrastViolations).toEqual([]);
    });

    test('buttons and badges meet color contrast requirements', async ({
      page,
      makeAxeBuilder,
    }) => {
      await loginUser(page);
      await page.waitForSelector('[data-testid="sidebar"]');

      // Check all interactive elements
      const accessibilityScanResults = await makeAxeBuilder().withTags(['wcag2aa']).analyze();

      const contrastViolations = accessibilityScanResults.violations.filter(
        (v) => v.id === 'color-contrast',
      );

      // Log violations for debugging if any
      if (contrastViolations.length > 0) {
        console.log('Color contrast violations:', JSON.stringify(contrastViolations, null, 2));
      }

      expect(contrastViolations).toEqual([]);
    });
  });

  test.describe('Keyboard Navigation', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('all sidebar folders are keyboard accessible', async ({ page }) => {
      await loginUser(page);
      await page.waitForSelector('[data-testid="sidebar"]');

      // Get all folder items
      const folderItems = page.getByTestId('folder-item');
      const count = await folderItems.count();

      expect(count).toBeGreaterThan(0);

      // Tab through all folder items
      for (let i = 0; i < count; i++) {
        await page.keyboard.press('Tab');
        const focused = page.locator(':focus');
        await expect(focused).toBeVisible();
      }
    });

    test('folder items can be activated with Enter key', async ({ page }) => {
      await loginUser(page);
      await page.waitForSelector('[data-testid="sidebar"]');

      // Focus on first folder
      const firstFolder = page.getByTestId('folder-item').first();
      await firstFolder.focus();

      // Activate with Enter
      await page.keyboard.press('Enter');

      // Verify selection changed (folder should now have selected state)
      await expect(firstFolder).toHaveAttribute('aria-current', 'page');
    });

    test('folder items can be activated with Space key', async ({ page }) => {
      await loginUser(page);
      await page.waitForSelector('[data-testid="sidebar"]');

      // Get second folder and focus on it
      const secondFolder = page.getByTestId('folder-item').nth(1);
      await secondFolder.focus();

      // Activate with Space
      await page.keyboard.press('Space');

      // Verify selection changed
      await expect(secondFolder).toHaveAttribute('aria-current', 'page');
    });

    test('sidebar navigation has correct ARIA labels', async ({ page }) => {
      await loginUser(page);
      await page.waitForSelector('[data-testid="sidebar"]');

      // Check sidebar has navigation role
      const nav = page.getByTestId('sidebar').locator('nav');
      await expect(nav).toHaveAttribute('aria-label', /folder/i);

      // Check folder items have appropriate aria attributes
      const folderItem = page.getByTestId('folder-item').first();
      await expect(folderItem).toHaveAttribute('aria-current');
    });

    test('focus is visible on all interactive elements', async ({ page }) => {
      await loginUser(page);
      await page.waitForSelector('[data-testid="sidebar"]');

      // Focus on folder item
      const folderItem = page.getByTestId('folder-item').first();
      await folderItem.focus();

      // Verify focus ring is visible (check computed styles)
      const outlineStyle = await folderItem.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          outline: styles.outline,
          outlineOffset: styles.outlineOffset,
          boxShadow: styles.boxShadow,
        };
      });

      // At least one focus indicator should be present
      const hasFocusIndicator =
        outlineStyle.outline !== 'none' ||
        outlineStyle.boxShadow !== 'none' ||
        outlineStyle.outlineOffset !== '0px';

      expect(hasFocusIndicator).toBe(true);
    });
  });

  test.describe('Mobile Accessibility', () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test('mobile toggle button has accessible name', async ({ page }) => {
      await loginUser(page);

      const mobileToggle = page.getByTestId('mobile-toggle');
      await expect(mobileToggle).toBeVisible();

      // Check for accessible name
      const ariaLabel = await mobileToggle.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel).toMatch(/menu|sidebar|navigation/i);
    });

    test('mobile toggle updates aria-expanded state', async ({ page }) => {
      await loginUser(page);

      const mobileToggle = page.getByTestId('mobile-toggle');
      await expect(mobileToggle).toBeVisible({ timeout: 5000 });

      // Initially closed
      await expect(mobileToggle).toHaveAttribute('aria-expanded', 'false');

      // Open sidebar
      await mobileToggle.click();
      await expect(mobileToggle).toHaveAttribute('aria-expanded', 'true', { timeout: 3000 });

      // Close via toggle button (instead of overlay for reliability)
      await mobileToggle.click();
      await expect(mobileToggle).toHaveAttribute('aria-expanded', 'false', { timeout: 3000 });
    });

    test('sidebar can be closed with Escape key on mobile', async ({ page }) => {
      await loginUser(page);

      // Open sidebar
      const mobileToggle = page.getByTestId('mobile-toggle');
      await mobileToggle.click();
      await page.waitForTimeout(300);

      // Sidebar should be visible
      const sidebar = page.getByTestId('sidebar');
      await expect(sidebar).toBeVisible();

      // Press Escape to close
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);

      // Sidebar should be hidden
      await expect(sidebar).not.toBeVisible();
    });

    test('mobile sidebar meets accessibility requirements', async ({ page, makeAxeBuilder }) => {
      await loginUser(page);

      // Open sidebar
      const mobileToggle = page.getByTestId('mobile-toggle');
      await mobileToggle.click();
      await page.waitForTimeout(300);

      const accessibilityScanResults = await makeAxeBuilder()
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });

  test.describe('Full Page Accessibility', () => {
    test.use({ viewport: { width: 1440, height: 900 } });

    test('timeline page with sidebar is fully accessible', async ({ page, makeAxeBuilder }) => {
      await loginUser(page);
      await page.waitForSelector('[data-testid="sidebar"]');
      await page.waitForSelector('[data-testid="article-list"]', { timeout: 10000 });

      const accessibilityScanResults = await makeAxeBuilder()
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Log all violations for debugging
      if (accessibilityScanResults.violations.length > 0) {
        console.log(
          'Accessibility violations:',
          JSON.stringify(accessibilityScanResults.violations, null, 2),
        );
      }

      expect(accessibilityScanResults.violations).toEqual([]);
    });
  });
});
