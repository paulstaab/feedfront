import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ArticlePreview, TimelineCacheEnvelope } from '@/types';
import {
  createEmptyTimelineCache,
  loadTimelineCache,
  pruneTimelineCache,
  storeTimelineCache,
} from '@/lib/storage/timelineCache';
import { CONFIG } from '@/lib/config/env';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function createPreview(overrides: Partial<ArticlePreview> = {}): ArticlePreview {
  return {
    id: overrides.id ?? Math.floor(Math.random() * 10_000),
    folderId: overrides.folderId ?? 1,
    feedId: overrides.feedId ?? 99,
    title: overrides.title ?? 'Sample article',
    summary: overrides.summary ?? 'Summary',
    url: overrides.url ?? 'https://example.com/article',
    thumbnailUrl: overrides.thumbnailUrl ?? null,
    pubDate: overrides.pubDate ?? Math.floor(Date.now() / 1000),
    unread: overrides.unread ?? true,
    starred: overrides.starred ?? false,
    hasFullText: overrides.hasFullText ?? true,
    storedAt: overrides.storedAt ?? Date.now(),
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-01-01T00:00:00Z'));
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('timeline cache helpers', () => {
  it('returns empty envelope when nothing is stored', () => {
    const envelope = loadTimelineCache();
    expect(envelope).toEqual(createEmptyTimelineCache());
  });

  it('persists and reloads pruned envelopes', () => {
    const envelope: TimelineCacheEnvelope = {
      version: CONFIG.TIMELINE_CACHE_VERSION,
      lastSynced: Date.now(),
      activeFolderId: 1,
      folders: {
        1: {
          id: 1,
          name: 'Engineering',
          sortOrder: 0,
          status: 'active',
          unreadCount: 2,
          articles: [createPreview({ id: 1 }), createPreview({ id: 2 })],
          lastUpdated: Date.now(),
        },
      },
      pendingReadIds: [1, 1, 2],
      pendingSkipFolderIds: [1, 42],
    };

    storeTimelineCache(envelope);
    const loaded = loadTimelineCache();

    expect(loaded.folders[1].articles).toHaveLength(2);
    expect(loaded.pendingReadIds).toEqual([1, 2]);
    expect(loaded.pendingSkipFolderIds).toEqual([1]);
  });

  it('drops stale articles and removes empty folders during pruning', () => {
    const now = Date.now();
    const oldTimestamp = now - (CONFIG.TIMELINE_MAX_ITEM_AGE_DAYS + 1) * DAY_IN_MS;

    const envelope: TimelineCacheEnvelope = {
      version: CONFIG.TIMELINE_CACHE_VERSION,
      lastSynced: now,
      activeFolderId: 1,
      folders: {
        1: {
          id: 1,
          name: 'Engineering',
          sortOrder: 0,
          status: 'queued',
          unreadCount: 1,
          articles: [createPreview({ id: 1, storedAt: oldTimestamp })],
          lastUpdated: now,
        },
        2: {
          id: 2,
          name: 'Design',
          sortOrder: 1,
          status: 'queued',
          unreadCount: CONFIG.TIMELINE_MAX_ITEMS_PER_FOLDER + 5,
          articles: Array.from({ length: CONFIG.TIMELINE_MAX_ITEMS_PER_FOLDER + 5 }, (_, index) =>
            createPreview({ id: 2000 + index, folderId: 2 }),
          ),
          lastUpdated: now,
        },
      },
      pendingReadIds: [],
      pendingSkipFolderIds: [],
    };

    const pruned = pruneTimelineCache(envelope, now);

    expect(pruned.folders[1]).toBeUndefined();
    expect(pruned.folders[2].articles).toHaveLength(CONFIG.TIMELINE_MAX_ITEMS_PER_FOLDER);
  });
});
