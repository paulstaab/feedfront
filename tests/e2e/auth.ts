import fs from 'fs/promises';
import path from 'path';
import { type Page } from '@playwright/test';

const STORAGE_DIR = path.join('tests', '.auth');
const STORAGE_FILE = path.join(STORAGE_DIR, 'storageState.json');
const SESSION_KEY = 'feedfront:session';

export interface LoginOptions {
  serverUrl: string;
  username: string;
  password: string;
  rememberDevice?: boolean;
}

export async function ensureLoggedIn(page: Page, opts: LoginOptions) {
  const hasSession = await page.evaluate((key) => {
    try {
      return !!(localStorage.getItem(key) ?? sessionStorage.getItem(key));
    } catch {
      return false;
    }
  }, SESSION_KEY);

  if (hasSession) return;

  // Try reusing a saved Playwright storageState file
  try {
    const raw = await fs.readFile(STORAGE_FILE, 'utf-8');
    interface SerializedStorageState {
      cookies?: {
        name: string;
        value: string;
        domain?: string;
        path?: string;
        expires?: number;
        httpOnly?: boolean;
        secure?: boolean;
        sameSite?: 'Strict' | 'Lax' | 'None';
      }[];
      origins?: {
        origin: string;
        localStorage?: { name: string; value: string }[];
        sessionStorage?: { name: string; value: string }[];
      }[];
    }

    const state = JSON.parse(raw) as SerializedStorageState;

    // Restore cookies (if any)
    if (state.cookies?.length) {
      // Playwright addCookies accepts domain/path attributes from the saved state
      await page.context().addCookies(
        state.cookies.map((c) => ({
          name: c.name,
          value: c.value,
          domain: c.domain,
          path: c.path,
          expires: c.expires,
          httpOnly: c.httpOnly,
          secure: c.secure,
          sameSite: c.sameSite,
        })),
      );
    }

    // Restore localStorage entries per origin
    if (Array.isArray(state.origins)) {
      for (const origin of state.origins) {
        try {
          // Navigate to the origin to be able to set storage for it
          await page.goto(origin.origin, { waitUntil: 'domcontentloaded' });
          if (Array.isArray(origin.localStorage)) {
            for (const item of origin.localStorage) {
              // localStorage only

              await page.evaluate(
                ([k, v]) => {
                  localStorage.setItem(k, v);
                },
                [item.name, item.value],
              );
            }
          }
        } catch {
          // ignore origin restore errors and continue
        }
      }
    }

    // Navigate to app root — app should detect stored session and redirect to timeline
    await page.goto('/');
    try {
      await page.waitForURL(/\/timeline/, { timeout: 10_000 });
    } catch {
      // ignore; some tests will continue and assert their own conditions
    }

    return;
  } catch {
    // Storage file missing — perform UI login and save state for reuse
  }

  // Perform UI login flow
  await page.goto('/login/');
  await page.waitForLoadState('networkidle');
  await page.getByLabel(/server url/i).fill(opts.serverUrl);
  await page.getByRole('button', { name: /^continue$/i }).click();
  await page.getByLabel(/username/i).fill(opts.username);
  await page.getByLabel(/password/i).fill(opts.password);
  if (opts.rememberDevice) {
    try {
      await page.getByLabel(/remember.*device|stay.*logged.*in/i).check();
    } catch {
      // ignore if the checkbox isn't present
    }
  }
  await page.getByRole('button', { name: /log.*in|sign.*in/i }).click();
  await page.waitForURL(/\/timeline/, { timeout: 10_000 });

  // Persist storage state for later tests
  try {
    const state = await page.context().storageState();
    await fs.mkdir(STORAGE_DIR, { recursive: true });
    await fs.writeFile(STORAGE_FILE, JSON.stringify(state));
  } catch {
    // best-effort — don't fail tests on write errors
  }
}

export default ensureLoggedIn;
