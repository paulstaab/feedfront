import React from 'react';

interface UnreadBadgeProps {
  count: number;
}

export const UnreadBadge: React.FC<UnreadBadgeProps> = ({ count }) => {
  if (count === 0) {
    return null;
  }

  const displayCount = count > 99 ? '99+' : count.toString();

  return (
    <span className="bg-primary text-white rounded-full px-2 py-1 text-xs font-medium">
      {displayCount}
    </span>
  );
};
