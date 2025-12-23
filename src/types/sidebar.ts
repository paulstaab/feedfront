import type { Folder } from './folder';

/**
 * State for sidebar visibility and behavior
 */
export interface SidebarState {
  /** Whether the sidebar is currently open (mobile) */
  isOpen: boolean;
}

/**
 * Filter options for folder display in sidebar
 */
export type FolderFilter = 'unread-only' | 'all';

/**
 * Re-export Folder for convenience
 */
export type { Folder };
