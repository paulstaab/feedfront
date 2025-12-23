import { FolderItem } from './FolderItem';
import type { FolderQueueEntry } from '@/types/folder';

interface FolderListProps {
  folders: FolderQueueEntry[];
  selectedFolderId?: number;
  onSelectFolder: (folderId: number) => void;
}

export function FolderList({ folders, selectedFolderId, onSelectFolder }: FolderListProps) {
  // Sort folders by queue priority (sortOrder)
  const sortedFolders = [...folders].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <nav aria-label="Folder navigation">
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {sortedFolders.map((folder) => (
          <li key={folder.id} style={{ marginBottom: '4px' }}>
            <FolderItem
              folder={folder}
              isSelected={folder.id === selectedFolderId}
              onClick={() => {
                onSelectFolder(folder.id);
              }}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
