/**
 * Playwright route interception for mocking API calls in E2E tests.
 * Uses similar data structures as MSW handlers but via Playwright's route API.
 */

import { type Page, type Route } from '@playwright/test';

// Mock data matching MSW handlers
export const mockFolders = [
  { id: 10, name: 'Engineering Updates', feeds: [101, 102] },
  { id: 20, name: 'Design Inspiration', feeds: [201] },
  { id: 30, name: 'Podcasts', feeds: [301] },
];

export const mockFeeds = [
  {
    id: 101,
    url: 'https://frontend.example.com/rss',
    title: 'Frontend Focus',
    faviconLink: 'https://frontend.example.com/favicon.ico',
    added: 1702200000,
    folderId: 10,
    link: 'https://frontend.example.com',
    pinned: false,
  },
  {
    id: 102,
    url: 'https://backend.example.com/rss',
    title: 'Backend Briefing',
    faviconLink: 'https://backend.example.com/favicon.ico',
    added: 1702105000,
    folderId: 10,
    link: 'https://backend.example.com',
    pinned: false,
  },
  {
    id: 201,
    url: 'https://design.example.com/rss',
    title: 'Design Notes',
    faviconLink: null,
    added: 1702000000,
    folderId: 20,
    link: 'https://design.example.com',
    pinned: true,
  },
  {
    id: 301,
    url: 'https://podcasts.example.com/rss',
    title: 'The Pod Stack',
    faviconLink: 'https://podcasts.example.com/icon.png',
    added: 1701900000,
    folderId: 30,
    link: 'https://podcasts.example.com',
    pinned: false,
  },
];

export const mockItems = [
  {
    id: 1001,
    title: 'Ship It Saturday: Folder Queue',
    content: '<p>Engineering just shipped the folder queue feature.</p>',
    author: 'Platform Team',
    body: '<p>Engineering just shipped the folder queue feature.</p>',
    feedId: 101,
    folderId: 10,
    guid: 'https://frontend.example.com/posts/folder-queue',
    pubDate: 1702199000,
    starred: false,
    unread: true,
    url: 'https://frontend.example.com/posts/folder-queue',
  },
  {
    id: 1002,
    title: 'Accessibility Improvements Rolling Out',
    content: '<p>New keyboard shortcuts now live.</p>',
    author: 'Accessibility Guild',
    body: '<p>New keyboard shortcuts now live.</p>',
    feedId: 102,
    folderId: 10,
    guid: 'https://backend.example.com/posts/accessibility',
    pubDate: 1702194000,
    starred: false,
    unread: true,
    url: 'https://backend.example.com/posts/accessibility',
  },
  {
    id: 1003,
    title: 'Observability Deep Dive',
    content: '<p>Tracing the folder queue pipeline end to end.</p>',
    author: 'Infra Team',
    body: '<p>Tracing the folder queue pipeline end to end.</p>',
    feedId: 101,
    folderId: 10,
    guid: 'https://frontend.example.com/posts/observability',
    pubDate: 1702189000,
    starred: false,
    unread: true,
    url: 'https://frontend.example.com/posts/observability',
  },
  {
    id: 2001,
    title: 'Color Systems for 2025',
    content: '<p>Exploring new gradient tokens.</p>',
    author: 'Design Systems',
    body: '<p>Exploring new gradient tokens.</p>',
    feedId: 201,
    folderId: 20,
    guid: 'https://design.example.com/posts/colors-2025',
    pubDate: 1702184000,
    starred: false,
    unread: true,
    url: 'https://design.example.com/posts/colors-2025',
  },
  {
    id: 2002,
    title: 'Motion Studies: Folder Stepper',
    content: '<p>Documenting the folder stepper animation curves.</p>',
    author: 'Motion Lab',
    body: '<p>Documenting the folder stepper animation curves.</p>',
    feedId: 201,
    folderId: 20,
    guid: 'https://design.example.com/posts/motion-folder-stepper',
    pubDate: 1702179000,
    starred: false,
    unread: true,
    url: 'https://design.example.com/posts/motion-folder-stepper',
  },
  {
    id: 3001,
    title: 'Pod Stack Episode 42',
    content: '<p>Discussing offline-first UX wins.</p>',
    author: 'Hosts',
    body: '<p>Discussing offline-first UX wins.</p>',
    feedId: 301,
    folderId: 30,
    guid: 'https://podcasts.example.com/episodes/42',
    pubDate: 1702174000,
    starred: false,
    unread: true,
    url: 'https://podcasts.example.com/episodes/42',
  },
];

/**
 * Set up API mocks for E2E tests using Playwright route interception.
 */
export async function setupApiMocks(page: Page, baseUrl = 'https://rss.example.com') {
  const apiPath = '/index.php/apps/news/api/v1-3';
  const apiBase = `${baseUrl}${apiPath}`;

  // Mock version endpoint (no auth required)
  await page.route(`${apiBase}/version`, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ version: '1.3.0' }),
    });
  });

  // Mock feeds endpoint
  await page.route(`${apiBase}/feeds`, async (route: Route) => {
    const request = route.request();
    const auth = request.headers().authorization;

    // Check for valid auth
    if (auth !== 'Basic dGVzdHVzZXI6dGVzdHBhc3M=') {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        feeds: mockFeeds,
        starredCount: 1,
        newestItemId: 103,
      }),
    });
  });

  // Mock items endpoint
  await page.route(`${apiBase}/items**`, async (route: Route) => {
    const request = route.request();
    const auth = request.headers().authorization;

    if (auth !== 'Basic dGVzdHVzZXI6dGVzdHBhc3M=') {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
      return;
    }

    const url = new URL(request.url());
    const getRead = url.searchParams.get('getRead') !== 'false';

    // Filter items based on getRead parameter
    const filteredItems = getRead ? mockItems : mockItems.filter((item) => item.unread);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items: filteredItems }),
    });
  });

  // Mock folders endpoint
  await page.route(`${apiBase}/folders`, async (route: Route) => {
    const request = route.request();
    const auth = request.headers().authorization;

    if (auth !== 'Basic dGVzdHVzZXI6dGVzdHBhc3M=') {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Unauthorized' }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ folders: mockFolders }),
    });
  });
}

/**
 * Set up mock for unreachable server (network error).
 */
export async function setupUnreachableServer(page: Page, baseUrl = 'https://rss.example.com') {
  const apiPath = '/index.php/apps/news/api/v1-3';
  const apiBase = `${baseUrl}${apiPath}`;

  await page.route(`${apiBase}/**`, async (route: Route) => {
    await route.abort('failed');
  });
}

/**
 * Set up mock for invalid API path (404).
 */
export async function setupInvalidApiPath(page: Page, baseUrl = 'https://rss.example.com') {
  const apiPath = '/index.php/apps/news/api/v1-3';
  const apiBase = `${baseUrl}${apiPath}`;

  await page.route(`${apiBase}/**`, async (route: Route) => {
    await route.fulfill({
      status: 404,
      contentType: 'text/html',
      body: '<html><body>Not Found</body></html>',
    });
  });
}
