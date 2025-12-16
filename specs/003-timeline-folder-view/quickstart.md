# Quickstart: Folder-Based Timeline View

## 1. Prerequisites

- Node 20.x (matches `.nvmrc`)
- pnpm 9.x or npm 10.x (repo uses npm scripts by default)
- A headless-rss instance reachable over HTTPS (or MSW mocks via `npm run dev`)
- Modern Chrome/Firefox for testing offline/service-worker features

## 2. Install & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. The service worker registers automatically in development. Use the login screen to provide your headless-rss base URL and credentials.

## 3. Working on the Folder Timeline

1. **Seed dummy data**: Enable MSW by running `npm run dev` (already configured). The `tests/mocks` handlers return sample feeds/folders/items so you can exercise the UI without a live backend.
2. **Toggle timeline cache**: Use DevTools → Application → Local Storage → `feedfront.timeline.v1` to inspect or reset the cached unread queue.
3. **Debug performance metrics**: Open the console to see `performance.measure` logs for `timeline-cache-ready` and `timeline-update-complete`.
4. **Offline simulation**: In DevTools → Network, check "Offline" and reload the timeline. You should still see cached articles plus the offline banner.

## 4. Test Commands

| Purpose | Command |
|---------|---------|
| Unit + hooks | `npm run test:unit` (Vitest) |
| Playwright E2E (headless) | `npx playwright test tests/e2e/timeline-folders.spec.ts` |
| Visual baselines | `npx playwright test tests/visual --update-snapshots` |
| Lint & types | `npm run lint && npm run typecheck` |

Playwright tests rely on the same MSW mocks; no external network is required.

## 5. Manual Smoke Checklist

1. Load the timeline; verify the highest-unread folder appears with newest article on top.
2. Expand an article card; confirm it disappears from the unread badge and is marked read in API logs.
3. Click **Mark All as Read**; the next folder should appear instantly.
4. Click **Skip** on a folder; the next folder loads while skipped one reappears after cycling.
5. Click **Update**; fresh articles append without losing current unread ones.
6. After completing all folders, confirm the "You've viewed all folders" screen with restart CTA.

## 6. Troubleshooting

| Symptom | Fix |
|---------|-----|
| Timeline blank after login | Clear `feedfront.timeline.v1` and `feedfront.session` entries; then reload. |
| Articles never mark as read | Ensure CORS allows `POST /items/*`; check console for 401/403. |
| Update button spins forever | Run `npm run dev -- --logLevel debug` to see SWR errors; network tab should show failing `/items` call. |
| Service worker cache stale | In DevTools → Application → Service Workers, click "Skip waiting" then reload.
