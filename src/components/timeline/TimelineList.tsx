'use client';

import type { ArticlePreview } from '@/types';
import { ArticleCard } from './ArticleCard';

interface TimelineListProps {
  items: ArticlePreview[];
  isLoading?: boolean;
  emptyMessage?: string;
  onMarkRead?: (id: number) => void;
}

/**
 * Folder-scoped article list with lightweight loading and empty-state handling.
 */
export function TimelineList({ items, isLoading, emptyMessage, onMarkRead }: TimelineListProps) {
  if (isLoading && items.length === 0) {
    return (
      <div className="py-10 text-center">
        <div className="inline-flex items-center gap-3 text-text-muted">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-border border-t-accent"></div>
          <span>Loading articles...</span>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-surface-muted border border-dashed border-border rounded-xl p-10 text-center text-text-muted">
        {emptyMessage ?? 'No unread articles in this folder.'}
      </div>
    );
  }

  return (
    <div data-testid="article-list">
      {items.map((article) => (
        <ArticleCard key={article.id} article={article} onMarkRead={onMarkRead} />
      ))}
    </div>
  );
}
