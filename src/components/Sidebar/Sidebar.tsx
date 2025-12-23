'use client';

import { useEffect, useLayoutEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(min-width: 768px)').matches;
    }
    return false;
  });

  useLayoutEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');

    const handler = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };
    media.addEventListener('change', handler);

    return () => {
      media.removeEventListener('change', handler);
    };
  }, []);

  // Escape key handler for mobile
  useEffect(() => {
    if (!isOpen || isDesktop) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [isOpen, isDesktop, close]);

  // Filter to only show folders with unread articles
  const visibleFolders = folders.filter((folder) => folder.unreadCount > 0);

  // Auto-select first folder if none selected
  const effectiveSelectedId = selectedFolderId ?? visibleFolders[0]?.id;

  const showSidebar = isOpen || isDesktop;

  return (
    <>
      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            data-testid="sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={`
              fixed left-0 top-0 h-full w-64 bg-bg-primary border-r border-border z-40
              md:relative md:z-auto
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
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile overlay - rendered after sidebar to ensure proper stacking */}
      {isOpen && !isDesktop && (
        <div
          data-testid="sidebar-overlay"
          className="fixed inset-0 bg-black/50 z-50 pointer-events-auto"
          onClick={close}
          aria-hidden="true"
        />
      )}
    </>
  );
}
