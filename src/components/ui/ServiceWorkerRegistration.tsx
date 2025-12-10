'use client';

/**
 * Service worker registration component.
 * Registers the service worker on mount.
 */

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/sw/register';

/**
 * Component that registers the service worker on mount.
 * Renders nothing visible.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    // Register SW after hydration
    void registerServiceWorker();
  }, []);

  return null;
}

export default ServiceWorkerRegistration;
