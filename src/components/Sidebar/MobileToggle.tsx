import { useSidebar } from './SidebarContext';

export function MobileToggle() {
  const { toggle } = useSidebar();

  return (
    <button
      onClick={toggle}
      className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-accent"
      aria-label="Toggle sidebar"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>
  );
}
