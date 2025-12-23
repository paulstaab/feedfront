'use client';

import { useState } from 'react';

interface MarkAllReadButtonProps {
  onMarkAllRead: () => Promise<void>;
  disabled?: boolean;
}

export function MarkAllReadButton({ onMarkAllRead, disabled }: MarkAllReadButtonProps) {
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  const handleClick = async () => {
    setIsMarkingRead(true);
    try {
      await onMarkAllRead();
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    } finally {
      setIsMarkingRead(false);
    }
  };

  return (
    <button
      data-testid="mark-all-read-button"
      onClick={() => {
        void handleClick();
      }}
      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm transition-colors"
      disabled={isMarkingRead || disabled}
    >
      {isMarkingRead && (
        <span
          className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          aria-hidden
        />
      )}
      {isMarkingRead ? 'Marking…' : 'Mark All as Read'}
    </button>
  );
}
