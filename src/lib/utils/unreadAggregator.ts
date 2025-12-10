/**
 * Client-side unread count aggregation utilities.
 * Computes unread counts for feeds and folders from article data.
 * Aligned with FR-005: Unread Management.
 */

import type { Article, Feed, Folder } from '@/types';
import { UNCATEGORIZED_FOLDER_ID } from '@/types';

/**
 * Counts unread articles per feed.
 * @returns Map of feedId to unread count
 */
export function countUnreadByFeed(articles: Article[]): Map<number, number> {
  const counts = new Map<number, number>();

  for (const article of articles) {
    if (article.unread) {
      const current = counts.get(article.feedId) ?? 0;
      counts.set(article.feedId, current + 1);
    }
  }

  return counts;
}

/**
 * Counts unread articles per folder.
 * Uses feed-to-folder mapping to aggregate counts.
 * @returns Map of folderId to unread count (uses UNCATEGORIZED_FOLDER_ID for root-level feeds)
 */
export function countUnreadByFolder(articles: Article[], feeds: Feed[]): Map<number, number> {
  // Build feedId -> folderId lookup
  const feedToFolder = new Map<number, number>();
  for (const feed of feeds) {
    feedToFolder.set(feed.id, feed.folderId ?? UNCATEGORIZED_FOLDER_ID);
  }

  // Aggregate by folder
  const counts = new Map<number, number>();
  for (const article of articles) {
    if (article.unread) {
      const folderId = feedToFolder.get(article.feedId) ?? UNCATEGORIZED_FOLDER_ID;
      const current = counts.get(folderId) ?? 0;
      counts.set(folderId, current + 1);
    }
  }

  return counts;
}

/**
 * Computes total unread count across all articles.
 */
export function countTotalUnread(articles: Article[]): number {
  return articles.filter((a) => a.unread).length;
}

/**
 * Updates feed objects with computed unread counts.
 * Returns new feed array with updated unreadCount values.
 */
export function applyUnreadCountsToFeeds(feeds: Feed[], unreadByFeed: Map<number, number>): Feed[] {
  return feeds.map((feed) => ({
    ...feed,
    unreadCount: unreadByFeed.get(feed.id) ?? 0,
  }));
}

/**
 * Updates folder objects with computed unread counts.
 * Returns new folder array with updated unreadCount values.
 */
export function applyUnreadCountsToFolders(
  folders: Folder[],
  unreadByFolder: Map<number, number>,
): Folder[] {
  return folders.map((folder) => ({
    ...folder,
    unreadCount: unreadByFolder.get(folder.id) ?? 0,
  }));
}

/**
 * Computes feedIds for each folder.
 * Returns new folder array with populated feedIds.
 */
export function computeFolderFeedIds(folders: Folder[], feeds: Feed[]): Folder[] {
  // Group feeds by folder
  const feedsByFolder = new Map<number, number[]>();
  for (const feed of feeds) {
    const folderId = feed.folderId ?? UNCATEGORIZED_FOLDER_ID;
    const existing = feedsByFolder.get(folderId) ?? [];
    existing.push(feed.id);
    feedsByFolder.set(folderId, existing);
  }

  return folders.map((folder) => ({
    ...folder,
    feedIds: feedsByFolder.get(folder.id) ?? [],
  }));
}

/**
 * Aggregation result containing enriched feeds and folders.
 */
export interface AggregationResult {
  feeds: Feed[];
  folders: Folder[];
  totalUnread: number;
  uncategorizedUnread: number;
}

/**
 * Full aggregation pipeline: computes all unread counts and enriches entities.
 * This is the main entry point for computing display-ready data.
 */
export function aggregateUnreadCounts(
  articles: Article[],
  feeds: Feed[],
  folders: Folder[],
): AggregationResult {
  const unreadByFeed = countUnreadByFeed(articles);
  const unreadByFolder = countUnreadByFolder(articles, feeds);

  const enrichedFeeds = applyUnreadCountsToFeeds(feeds, unreadByFeed);
  const foldersWithFeedIds = computeFolderFeedIds(folders, feeds);
  const enrichedFolders = applyUnreadCountsToFolders(foldersWithFeedIds, unreadByFolder);

  return {
    feeds: enrichedFeeds,
    folders: enrichedFolders,
    totalUnread: countTotalUnread(articles),
    uncategorizedUnread: unreadByFolder.get(UNCATEGORIZED_FOLDER_ID) ?? 0,
  };
}

/**
 * Filters articles by feed ID.
 */
export function filterArticlesByFeed(articles: Article[], feedId: number): Article[] {
  return articles.filter((a) => a.feedId === feedId);
}

/**
 * Filters articles by folder ID.
 */
export function filterArticlesByFolder(
  articles: Article[],
  feeds: Feed[],
  folderId: number,
): Article[] {
  const feedIdsInFolder = new Set(
    feeds.filter((f) => (f.folderId ?? UNCATEGORIZED_FOLDER_ID) === folderId).map((f) => f.id),
  );
  return articles.filter((a) => feedIdsInFolder.has(a.feedId));
}

/**
 * Gets unread articles only.
 */
export function filterUnreadArticles(articles: Article[]): Article[] {
  return articles.filter((a) => a.unread);
}

/**
 * Gets starred articles only.
 */
export function filterStarredArticles(articles: Article[]): Article[] {
  return articles.filter((a) => a.starred);
}
