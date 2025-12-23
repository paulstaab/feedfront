'use client';

import { useEffect, useState } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if we're on mobile (only needed for escape key and mobile sidebar)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Escape key handler for mobile
  useEffect(() => {
    if (!isOpen || !isMobile) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
    };
  }, [isOpen, isMobile, close]);

  // Filter to only show folders with unread articles
  const visibleFolders = folders.filter((folder) => folder.unreadCount > 0);

  // Auto-select first folder if none selected
  const effectiveSelectedId = selectedFolderId ?? visibleFolders[0]?.id;

  // On mobile, only show when isOpen is true
  const showMobileSidebar = isMobile && isOpen;

  return (
    <>
      {/* Desktop Sidebar - always visible via CSS media query */}
      <aside
        data-testid="sidebar"
        className="desktop-sidebar"
        role="navigation"
        aria-label="Folder navigation"
      >
        {/* Header */}
        <div className="px-5 py-6 text-center">
          <h2 className="text-xl font-semibold text-text">FeedFront</h2>
        </div>

        {/* Folder list - scrollable */}
        <div className="flex-1 overflow-y-auto px-2">
          <FolderList
            folders={visibleFolders}
            selectedFolderId={effectiveSelectedId}
            onSelectFolder={onSelectFolder}
          />
        </div>
      </aside>

      {/* Mobile Sidebar - animated overlay */}
      <AnimatePresence>
        {showMobileSidebar && (
          <>
            {/* Overlay */}
            <motion.div
              data-testid="sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 sm:hidden"
              onClick={close}
              aria-hidden="true"
            />

            {/* Sidebar */}
            <motion.aside
              data-testid="sidebar-mobile"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="fixed left-0 top-0 h-full w-64 z-50 sm:hidden"
              style={{ backgroundColor: 'hsl(220, 20%, 24%)' }}
              role="navigation"
              aria-label="Folder navigation"
            >
              <div className="flex flex-col h-full">
                {/* Header */}
                <div className="px-5 py-6 text-center">
                  <h2 className="text-xl font-semibold text-text">FeedFront</h2>
                </div>

                {/* Folder list - scrollable */}
                <div className="flex-1 overflow-y-auto px-3">
                  <FolderList
                    folders={visibleFolders}
                    selectedFolderId={effectiveSelectedId}
                    onSelectFolder={(folderId) => {
                      onSelectFolder(folderId);
                      close();
                    }}
                  />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
