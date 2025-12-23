import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import type { FolderQueueEntry } from '@/types/folder';

// Mock the useSidebar hook to always return open for navigation tests
vi.mock('@/components/Sidebar/SidebarContext', () => ({
  SidebarProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSidebar: () => ({
    isOpen: true,
    toggle: vi.fn(),
    close: vi.fn(),
  }),
}));

const mockFolders: FolderQueueEntry[] = [
  {
    id: 1,
    name: 'Tech News',
    unreadCount: 5,
    articles: [],
    sortOrder: 0,
    status: 'queued',
    lastUpdated: Date.now(),
  },
  {
    id: 2,
    name: 'Sports',
    unreadCount: 0,
    articles: [],
    sortOrder: 1,
    status: 'queued',
    lastUpdated: Date.now(),
  },
  {
    id: 3,
    name: 'Politics',
    unreadCount: 3,
    articles: [],
    sortOrder: 2,
    status: 'queued',
    lastUpdated: Date.now(),
  },
];

describe('Sidebar Navigation', () => {
  it('renders only folders with unread articles', () => {
    const onSelectFolder = vi.fn();

    render(<Sidebar folders={mockFolders} selectedFolderId={1} onSelectFolder={onSelectFolder} />);

    // Should show Tech News and Politics, but not Sports
    expect(screen.getByText('Tech News')).toBeInTheDocument();
    expect(screen.getByText('Politics')).toBeInTheDocument();
    expect(screen.queryByText('Sports')).not.toBeInTheDocument();
  });

  it('hides folders when their unreadCount becomes 0', () => {
    const foldersWithZero: FolderQueueEntry[] = [
      ...mockFolders,
      {
        id: 4,
        name: 'Empty Folder',
        unreadCount: 0,
        articles: [],
        sortOrder: 3,
        status: 'queued',
        lastUpdated: Date.now(),
      },
    ];
    const onSelectFolder = vi.fn();

    render(
      <Sidebar folders={foldersWithZero} selectedFolderId={1} onSelectFolder={onSelectFolder} />,
    );

    expect(screen.getByText('Tech News')).toBeInTheDocument();
    expect(screen.getByText('Politics')).toBeInTheDocument();
    expect(screen.queryByText('Sports')).not.toBeInTheDocument();
    expect(screen.queryByText('Empty Folder')).not.toBeInTheDocument();
  });

  it('highlights the selected folder', () => {
    const onSelectFolder = vi.fn();

    render(<Sidebar folders={mockFolders} selectedFolderId={1} onSelectFolder={onSelectFolder} />);

    const techNewsItem = screen.getByText('Tech News');
    expect(techNewsItem.parentElement).toHaveClass('bg-accent'); // Assuming selected styling
  });

  it('calls onSelectFolder when clicking a folder', () => {
    const onSelectFolder = vi.fn();

    render(<Sidebar folders={mockFolders} selectedFolderId={1} onSelectFolder={onSelectFolder} />);

    const politicsItem = screen.getByText('Politics');
    fireEvent.click(politicsItem);

    expect(onSelectFolder).toHaveBeenCalledWith(3);
  });

  it('selects first folder with unread articles when no selectedFolderId', () => {
    const onSelectFolder = vi.fn();

    render(
      <Sidebar
        folders={mockFolders}
        selectedFolderId={undefined}
        onSelectFolder={onSelectFolder}
      />,
    );

    // Should automatically select first unread folder (id: 1)
    // This might be handled by initial selection logic
    // For now, assume it renders with first as selected
    const techNewsItem = screen.getByText('Tech News');
    expect(techNewsItem.parentElement).toHaveClass('bg-accent');
  });
});
