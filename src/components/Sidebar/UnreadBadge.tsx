import React from 'react';

interface UnreadBadgeProps {
  count: number;
  isSelected?: boolean;
}

export const UnreadBadge: React.FC<UnreadBadgeProps> = ({ count, isSelected = false }) => {
  if (count === 0) {
    return null;
  }

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <span
      className={`
        inline-flex items-center justify-center min-w-[24px] h-6 px-2.5
        text-xs font-medium rounded-full flex-shrink-0
        transition-colors duration-fast
        ${isSelected ? 'bg-white/20 text-white' : 'bg-accent text-white'}
      `}
      aria-label={`${String(count)} unread articles`}
    >
      {displayCount}
    </span>
  );
};
