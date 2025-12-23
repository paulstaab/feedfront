'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { formatDistanceToNow } from 'date-fns';
import type { Article, ArticlePreview } from '@/types';
import { getArticle } from '@/lib/api/items';

interface ArticleCardProps {
  article: ArticlePreview;
  onMarkRead?: (id: number) => void;
}

/**
 * Lightweight article preview card for the folder-first timeline.
 * Shows title, summary, thumbnail, and publication time.
 * Expands to show full content on click.
 */
export function ArticleCard({ article, onMarkRead }: ArticleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const publishedDate = article.pubDate ? new Date(article.pubDate * 1000) : null;

  const {
    data: fullArticle,
    error,
    isLoading,
  } = useSWR<Article | null, Error>(isExpanded ? `article-${String(article.id)}` : null, async () =>
    getArticle(article.id),
  );

  const handleExpand = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      onMarkRead?.(article.id);
    } else {
      setIsExpanded(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleExpand();
    }
  };

  return (
    <div
      data-testid="article-item"
      style={{
        backgroundColor: 'hsl(220, 20%, 24%)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
      }}
      className="transition-all duration-normal cursor-pointer hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      role="article"
      aria-label={`${article.title || 'Untitled article'}, ${article.unread ? 'unread' : 'read'}. Click to ${isExpanded ? 'collapse' : 'expand'}.`}
      onClick={handleExpand}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="flex flex-col gap-3">
        {/* Header row with title and metadata */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-accent hover:text-accent-strong transition-colors duration-fast focus:outline-none focus:underline"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                aria-label={`Open ${article.title || 'article'} in new tab`}
              >
                {article.title || 'Untitled article'}
              </a>
            </div>
          </div>

          {/* Right side metadata */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0 text-right">
            {publishedDate && (
              <time className="text-sm text-text-muted" dateTime={publishedDate.toISOString()}>
                {formatDistanceToNow(publishedDate, { addSuffix: true })}
              </time>
            )}
          </div>
        </div>

        {/* Summary */}
        <p className="text-text-muted leading-relaxed line-clamp-2">
          {article.summary || 'No summary available for this article.'}
        </p>
      </div>

      {isExpanded && (
        <div
          className="mt-4 pt-4 border-t border-border-subtle animate-in fade-in slide-in-from-top-2 duration-200"
          onClick={(e) => {
            e.stopPropagation();
          }}
          onKeyDown={(e) => {
            e.stopPropagation();
          }}
          role="presentation"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-text-muted text-sm py-4 justify-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-accent" />
              Loading full article...
            </div>
          ) : error ? (
            <div className="text-error text-sm py-2 text-center">
              Failed to load article content. Please try again.
            </div>
          ) : (
            <div
              className="prose prose-invert prose-sm max-w-none text-text-muted"
              dangerouslySetInnerHTML={{ __html: fullArticle?.body ?? '' }}
            />
          )}
        </div>
      )}
    </div>
  );
}
