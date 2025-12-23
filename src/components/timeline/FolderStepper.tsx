'use client';

import { useState } from 'react';
import type { FolderQueueEntry } from '@/types';

interface FolderStepperProps {
  activeFolder: FolderQueueEntry | null;
  remainingFolders: number;
  onRefresh: () => void;
  onSkip?: (folderId: number) => Promise<void>;
  isUpdating: boolean;
}

export function FolderStepper({ activeFolder, onRefresh, onSkip, isUpdating }: FolderStepperProps) {
  const [isSkipping, setIsSkipping] = useState(false);

  const handleSkip = async () => {
    if (!activeFolder || !onSkip) return;

    setIsSkipping(true);
    try {
      await onSkip(activeFolder.id);
    } catch (error) {
      console.error(
        'Failed to skip folder:',
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setIsSkipping(false);
    }
  };

  const buttonBaseClass =
    'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-colors duration-fast disabled:opacity-60';
  const outlinedButtonClass = `${buttonBaseClass} border-border-subtle text-text-muted hover:text-text hover:bg-surface-elevated`;

  return (
    <section className="mb-6">
      <div className="flex flex-wrap items-center gap-2">
        {activeFolder && onSkip && (
          <button
            onClick={() => {
              void handleSkip();
            }}
            className={outlinedButtonClass}
            disabled={isSkipping || isUpdating}
          >
            <span>»</span>
            {isSkipping ? 'Skipping…' : 'Skip Folder'}
          </button>
        )}
        <button onClick={onRefresh} className={outlinedButtonClass} disabled={isUpdating}>
          {isUpdating ? (
            <span
              className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"
              aria-hidden
            />
          ) : (
            <span>↻</span>
          )}
          {isUpdating ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>
    </section>
  );
}
