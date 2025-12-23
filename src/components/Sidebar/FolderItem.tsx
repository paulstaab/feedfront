import type { FolderQueueEntry } from '@/types/folder';
import { UnreadBadge } from './UnreadBadge';

interface FolderItemProps {
  folder: FolderQueueEntry;
  isSelected: boolean;
  onClick: () => void;
}

export function FolderItem({ folder, isSelected, onClick }: FolderItemProps) {
  return (
    <button
      data-testid="folder-item"
      data-selected={isSelected}
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between gap-3 transition-colors ${
        isSelected ? 'bg-accent text-white font-medium' : 'text-text hover:bg-surface-muted'
      }`}
      aria-current={isSelected ? 'page' : undefined}
    >
      <span className="overflow-hidden text-ellipsis whitespace-nowrap" title={folder.name}>
        {folder.name}
      </span>
      <UnreadBadge count={folder.unreadCount} isSelected={isSelected} />
    </button>
  );
}
