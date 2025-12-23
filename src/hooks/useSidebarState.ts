import { useState, useEffect, useLayoutEffect } from 'react';

const SIDEBAR_OPEN_KEY = 'sidebar-open';

/**
 * SSR-safe hook for sidebar visibility state with localStorage persistence
 * Defaults to closed on mobile, persists user preference
 */
export function useSidebarState() {
  // Always start with false to match server render
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // After mount, load from localStorage if available
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
    const stored = localStorage.getItem(SIDEBAR_OPEN_KEY);
    if (stored !== null) {
      setIsOpen(JSON.parse(stored) as boolean);
    }
  }, []);

  // Persist to localStorage whenever isOpen changes (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(SIDEBAR_OPEN_KEY, JSON.stringify(isOpen));
    }
  }, [isOpen, isHydrated]);

  const toggle = () => {
    setIsOpen((prev) => !prev);
  };
  const close = () => {
    setIsOpen(false);
  };

  return { isOpen, toggle, close };
}
