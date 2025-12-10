/**
 * Typed domain wrapper for the Folders API.
 * Aligned with contracts/folders.md
 */

import { apiGet, apiPost, apiPut, apiDelete } from './client';
import { type Folder, type FoldersResponse, normalizeFolder } from '@/types';

/**
 * Fetches all folders.
 */
export async function getFolders(): Promise<Folder[]> {
  const response = await apiGet<FoldersResponse>('/folders');
  return response.folders.map(normalizeFolder);
}

/**
 * Creates a new folder.
 */
export async function createFolder(name: string): Promise<Folder> {
  const response = await apiPost<FoldersResponse>('/folders', { name });
  // API returns the created folder in folders array
  const folders = response.folders.map(normalizeFolder);
  if (folders.length === 0) {
    throw new Error('No folder returned from create operation');
  }
  return folders[0];
}

/**
 * Renames an existing folder.
 */
export async function renameFolder(folderId: number, name: string): Promise<void> {
  await apiPut(`/folders/${String(folderId)}`, { name });
}

/**
 * Deletes a folder.
 */
export async function deleteFolder(folderId: number): Promise<void> {
  await apiDelete(`/folders/${String(folderId)}`);
}

/**
 * Marks all items in a folder as read.
 */
export async function markFolderRead(folderId: number, newestItemId: number): Promise<void> {
  await apiPost(`/folders/${String(folderId)}/read`, { newestItemId });
}
