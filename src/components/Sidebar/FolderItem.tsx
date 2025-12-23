import type { FolderQueueEntry } from '@/types/folder';

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
      className={`
        w-full text-left px-3 py-2 rounded-md transition-colors
        hover:bg-bg-surface focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg-primary
        ${isSelected ? 'bg-accent text-bg-primary font-medium' : 'text-text hover:text-text'}
      `}
      aria-current={isSelected ? 'page' : undefined}
    >
      <span className="truncate block">{folder.name}</span>
    </button>
  );
}
