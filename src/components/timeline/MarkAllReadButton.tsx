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
      className={`
        inline-flex items-center justify-center gap-2 px-5 py-2.5
        rounded-full bg-accent text-white text-sm font-medium
        hover:bg-accent-strong
        focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface
        disabled:opacity-60 disabled:cursor-not-allowed
        shadow-md transition-all duration-fast
        active:scale-[0.98]
      `}
      disabled={isMarkingRead || disabled}
    >
      {isMarkingRead && (
        <span
          className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"
          aria-hidden
        />
      )}
      <span className="text-white">✓</span> {isMarkingRead ? 'Marking…' : 'Mark All as Read'}
    </button>
  );
}
