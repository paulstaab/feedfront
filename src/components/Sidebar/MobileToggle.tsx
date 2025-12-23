import { useSidebar } from './SidebarContext';

export function MobileToggle() {
  const { isOpen, toggle } = useSidebar();

  return (
    <button
      onClick={toggle}
      data-testid="mobile-toggle"
      className={`
        sm:hidden flex items-center justify-center
        w-10 h-10 rounded-lg
        text-text-muted hover:text-text
        hover:bg-surface-muted
        focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary
        transition-colors duration-fast
      `}
      aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
      aria-expanded={isOpen}
    >
      {isOpen ? (
        // Close icon (X)
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ) : (
        // Hamburger icon
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      )}
    </button>
  );
}
