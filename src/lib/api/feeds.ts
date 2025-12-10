/**
 * Typed domain wrapper for the Feeds API.
 * Aligned with contracts/feeds.md
 */

import { apiGet, apiPost, apiDelete } from './client';
import { type Feed, type ApiFeed, type FeedsResponse, normalizeFeed } from '@/types';

/**
 * Fetches all subscribed feeds.
 */
export async function getFeeds(): Promise<{
  feeds: Feed[];
  starredCount: number;
  newestItemId: number | null;
}> {
  const response = await apiGet<FeedsResponse>('/feeds');
  return {
    feeds: response.feeds.map(normalizeFeed),
    starredCount: response.starredCount ?? 0,
    newestItemId: response.newestItemId ?? null,
  };
}

/**
 * Adds a new feed subscription.
 */
export async function createFeed(
  url: string,
  folderId: number | null = null,
): Promise<{ feed: Feed; newestItemId: number | null }> {
  const response = await apiPost<{ feeds: ApiFeed[]; newestItemId: number | null }>('/feeds', {
    url,
    folderId,
  });
  const feeds = response.feeds;
  if (feeds.length === 0) {
    throw new Error('No feed returned from create');
  }
  return {
    feed: normalizeFeed(feeds[0]),
    newestItemId: response.newestItemId,
  };
}

/**
 * Deletes a feed subscription.
 */
export async function deleteFeed(feedId: number): Promise<void> {
  await apiDelete(`/feeds/${String(feedId)}`);
}

/**
 * Moves a feed to a different folder.
 */
export async function moveFeed(feedId: number, folderId: number | null): Promise<void> {
  await apiPost(`/feeds/${String(feedId)}/move`, { folderId });
}

/**
 * Renames a feed.
 */
export async function renameFeed(feedId: number, feedTitle: string): Promise<void> {
  await apiPost(`/feeds/${String(feedId)}/rename`, { feedTitle });
}

/**
 * Marks all items in a feed as read up to a specific item ID.
 */
export async function markFeedRead(feedId: number, newestItemId: number): Promise<void> {
  await apiPost(`/feeds/${String(feedId)}/read`, { newestItemId });
}
