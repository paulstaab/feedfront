'use client';

import { FolderList } from './FolderList';
import { useSidebar } from './SidebarContext';
import type { FolderQueueEntry } from '@/types/folder';

interface SidebarProps {
  folders: FolderQueueEntry[];
  selectedFolderId?: number;
  onSelectFolder: (folderId: number) => void;
}

export function Sidebar({ folders, selectedFolderId, onSelectFolder }: SidebarProps) {
  const { isOpen, close } = useSidebar();

  // Filter to only show folders with unread articles
  const visibleFolders = folders.filter((folder) => folder.unreadCount > 0);

  // Auto-select first folder if none selected
  const effectiveSelectedId = selectedFolderId ?? visibleFolders[0]?.id;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        data-testid="sidebar"
        className={`
          fixed left-0 top-0 h-full w-64 bg-bg-primary border-r border-border
          transform transition-transform duration-200 ease-in-out z-50
          md:relative md:translate-x-0 md:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-text">Folders</h2>
          </div>

          {/* Folder list - scrollable */}
          <div className="flex-1 overflow-y-auto">
            <FolderList
              folders={visibleFolders}
              selectedFolderId={effectiveSelectedId}
              onSelectFolder={(folderId) => {
                onSelectFolder(folderId);
                // Close mobile sidebar on selection
                close();
              }}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
