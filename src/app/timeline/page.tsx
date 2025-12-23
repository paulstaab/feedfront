'use client';

import { Suspense, useEffect, useLayoutEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useFolderQueue } from '@/hooks/useFolderQueue';
import { FolderStepper } from '@/components/timeline/FolderStepper';
import { TimelineList } from '@/components/timeline/TimelineList';
import { EmptyState } from '@/components/timeline/EmptyState';
import { MarkAllReadButton } from '@/components/timeline/MarkAllReadButton';
import { RequestStateToast, useToast } from '@/components/ui/RequestStateToast';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { MobileToggle } from '@/components/Sidebar/MobileToggle';
import {
  markTimelineCacheLoadStart,
  markTimelineCacheReady,
  markTimelineUpdateStart,
  markTimelineUpdateComplete,
} from '@/lib/metrics/metricsClient';

/**
 * Timeline page content component
 * Extracted to wrap useSearchParams in Suspense
 */
function TimelineContent() {
  const router = useRouter();
  const { isAuthenticated, isInitializing } = useAuth();
  const [isDesktop, setIsDesktop] = useState(false);

  useLayoutEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    setIsDesktop(media.matches);

    const handler = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches);
    };
    media.addEventListener('change', handler);

    return () => {
      media.removeEventListener('change', handler);
    };
  }, []);

  // Mark cache load start before hook initialization
  useEffect(() => {
    markTimelineCacheLoadStart();
  }, []);

  const {
    queue,
    activeFolder,
    activeArticles,
    progress,
    totalUnread,
    isHydrated,
    isUpdating,
    error,
    refresh,
    markFolderRead,
    markItemRead,
    skipFolder,
    selectFolder,
    restart,
    lastUpdateError,
  } = useFolderQueue();

  const { toasts, showToast, dismissToast } = useToast();

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isInitializing, router]);

  // Mark cache ready after hydration
  useEffect(() => {
    if (isHydrated) {
      markTimelineCacheReady();
    }
  }, [isHydrated]);

  // Automatic update on mount (US5 requirement)
  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      markTimelineUpdateStart();
      // Trigger refresh to get latest articles and merge with cache
      void refresh()
        .then(() => {
          markTimelineUpdateComplete();
        })
        .catch(() => {
          // Error already logged and retried in useFolderQueue
          // Just mark the update as complete (with error)
          markTimelineUpdateComplete();
        });
    }
    // Only run on mount when hydrated and authenticated
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, isAuthenticated]);

  // Show toast when update fails after all retries
  useEffect(() => {
    if (lastUpdateError) {
      showToast({
        title: 'Update Failed',
        message: `Failed to update timeline: ${lastUpdateError}`,
        type: 'error',
        duration: 5000,
      });
    }
  }, [lastUpdateError, showToast]);

  // Show loading state while checking authentication
  if (isInitializing || !isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="inline-flex items-center gap-3 text-text-muted">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-border border-t-accent"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  const activeFolderUnread = activeFolder?.unreadCount ?? 0;
  const remainingFolders = progress.remainingFolderIds.length;

  const showEmptyState = !activeFolder;

  let emptyStateType: 'no-unread' | 'no-items' | 'offline' | 'error' | 'all-viewed' = 'no-unread';
  if (error) {
    emptyStateType = 'error';
  } else if (totalUnread === 0) {
    emptyStateType = 'no-unread';
  } else {
    emptyStateType = 'all-viewed';
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar */}
      <Sidebar folders={queue} selectedFolderId={activeFolder?.id} onSelectFolder={selectFolder} />

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 pt-4 sm:pt-6 bg-surface">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {!isDesktop && <MobileToggle />}
                <div className="flex items-baseline gap-3">
                  <h1
                    className="text-xl sm:text-2xl font-bold text-text"
                    data-testid={activeFolder ? 'active-folder-name' : undefined}
                  >
                    {activeFolder?.name ?? 'Timeline'}
                  </h1>
                  {activeFolder && (
                    <span data-testid="active-folder-unread" className="text-text-muted text-sm">
                      ({activeFolderUnread} Unread)
                    </span>
                  )}
                </div>
              </div>

              {/* Total count */}
              <div className="text-text-muted text-sm">
                {totalUnread > 0 ? `${String(totalUnread)} total` : 'All caught up!'}
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <FolderStepper
            activeFolder={activeFolder}
            remainingFolders={remainingFolders}
            onRefresh={() => {
              markTimelineUpdateStart();
              void refresh().then(() => {
                markTimelineUpdateComplete();
              });
            }}
            onSkip={(folderId) => skipFolder(folderId)}
            isUpdating={isUpdating}
          />

          {showEmptyState ? (
            <EmptyState
              type={emptyStateType}
              action={
                emptyStateType === 'error'
                  ? {
                      label: 'Retry',
                      onClick: () => {
                        void refresh();
                      },
                    }
                  : emptyStateType === 'all-viewed'
                    ? {
                        label: 'Restart',
                        onClick: () => {
                          void restart();
                        },
                      }
                    : undefined
              }
            />
          ) : (
            <>
              <TimelineList
                items={activeArticles}
                isLoading={isUpdating && activeArticles.length === 0}
                emptyMessage={`No unread articles left in ${activeFolder.name}.`}
                onMarkRead={(id) => {
                  void markItemRead(id);
                }}
              />
              {activeFolderUnread > 0 && (
                <div className="flex justify-center mt-8">
                  <MarkAllReadButton
                    onMarkAllRead={() => markFolderRead(activeFolder.id)}
                    disabled={isUpdating}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Toast notifications for errors */}
      {toasts.map((toast) => (
        <RequestStateToast key={toast.id} message={toast} onDismiss={dismissToast} />
      ))}
    </div>
  );
}

/**
 * Timeline page - aggregated article feed
 *
 * Features:
 * - Unread/All toggle with URL synchronization
 * - Infinite scroll with 75% prefetch
 * - Empty states (no items, offline, etc.)
 * - Offline-friendly guardrails
 * - Read/star actions
 */
export default function TimelinePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-2 border-border border-t-accent mb-4"></div>
            <p className="text-text-muted">Loading timeline...</p>
          </div>
        </div>
      }
    >
      <TimelineContent />
    </Suspense>
  );
}
