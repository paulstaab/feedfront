import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UnreadBadge } from '@/components/Sidebar/UnreadBadge';

describe('UnreadBadge', () => {
  it('renders the count when count is between 1 and 99', () => {
    render(<UnreadBadge count={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders "99+" when count is 100', () => {
    render(<UnreadBadge count={100} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('renders "99+" when count is more than 99', () => {
    render(<UnreadBadge count={150} />);
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('does not render when count is 0', () => {
    const { container } = render(<UnreadBadge count={0} />);
    expect(container.firstChild).toBeNull();
  });

  it('applies correct styling for circular badge', () => {
    render(<UnreadBadge count={5} />);
    const badge = screen.getByText('5');
    expect(badge).toHaveClass('bg-primary');
    expect(badge).toHaveClass('text-white');
    expect(badge).toHaveClass('rounded-full');
  });
});
