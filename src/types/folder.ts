/**
 * Organizational container for feeds; mirrors Nextcloud News folder entity.
 */
export interface Folder {
  /** Unique folder ID from API */
  id: number;

  /** Display name */
  name: string;

  /** Computed: total unread count across contained feeds */
  unreadCount: number;

  /** Computed: array of feed IDs in this folder */
  feedIds: number[];
}

/** Raw folder object returned by the Nextcloud News API */
export interface ApiFolder {
  id: number;
  name: string;
}

/** Response wrapper for GET /folders */
export interface FoldersResponse {
  folders: ApiFolder[];
}

/** Transforms API folder into internal Folder with defaults */
export function normalizeFolder(api: ApiFolder): Folder {
  return {
    id: api.id,
    name: api.name,
    unreadCount: 0, // computed client-side
    feedIds: [], // populated after feeds are fetched
  };
}

/** Virtual folder ID for uncategorized feeds (root-level) */
export const UNCATEGORIZED_FOLDER_ID = -1;
