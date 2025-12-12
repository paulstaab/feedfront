/**
 * Runtime environment guards and configuration.
 * Enforces HTTPS hosts, exposes feature flags, and provides actionable error copy.
 */

/** Storage key for debug mode preference */
const DEBUG_KEY = 'feedfront:debug';

/**
 * Checks if a URL is secure (HTTPS or localhost for development).
 */
export function isSecureUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Allow localhost/127.0.0.1 for development
    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      return true;
    }
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Normalizes a base URL by removing trailing slashes and validating format.
 * Returns null if the URL is invalid.
 */
export function normalizeBaseUrl(url: string): string | null {
  try {
    const trimmed = url.trim();
    if (!trimmed) return null;

    // Add protocol if missing (assume https)
    const protocolPattern = /^https?:\/\//;
    const withProtocol = protocolPattern.exec(trimmed) ? trimmed : `https://${trimmed}`;

    const parsed = new URL(withProtocol);
    // Remove trailing slash and return origin + pathname (without trailing slash)
    const normalized = `${parsed.origin}${parsed.pathname}`.replace(/\/+$/, '');
    return normalized;
  } catch {
    return null;
  }
}

/**
 * Validates a server URL and returns an actionable error message if invalid.
 */
export function validateServerUrl(url: string): { valid: boolean; error?: string } {
  const normalized = normalizeBaseUrl(url);

  if (!normalized) {
    return { valid: false, error: 'Please enter a valid server URL.' };
  }

  if (!isSecureUrl(normalized)) {
    return {
      valid: false,
      error: 'Server URL must use HTTPS for security. Only localhost is allowed over HTTP.',
    };
  }

  return { valid: true };
}

/**
 * Feature flags for conditional functionality.
 */
export interface FeatureFlags {
  /** Enable debug mode (verbose logging, diagnostics panel) */
  debug: boolean;
  /** Enable offline mode indicator */
  offlineMode: boolean;
  /** Enable experimental features */
  experimental: boolean;
}

/**
 * Returns current feature flags based on environment and localStorage overrides.
 */
export function getFeatureFlags(): FeatureFlags {
  const isDebugStored = typeof window !== 'undefined' && localStorage.getItem(DEBUG_KEY) === 'true';
  const isDev = process.env.NODE_ENV === 'development';

  return {
    debug: isDev || isDebugStored,
    offlineMode: true, // always enabled
    experimental: isDev,
  };
}

/**
 * Enables or disables debug mode.
 */
export function setDebugMode(enabled: boolean): void {
  if (typeof window !== 'undefined') {
    if (enabled) {
      localStorage.setItem(DEBUG_KEY, 'true');
    } else {
      localStorage.removeItem(DEBUG_KEY);
    }
  }
}

/**
 * App configuration constants.
 */
export const CONFIG = {
  /** API path prefix for Nextcloud News */
  API_PATH: '/index.php/apps/news/api/v1-3',

  /** Default batch size for item fetching */
  DEFAULT_BATCH_SIZE: 50,

  /** SWR deduplication interval in milliseconds */
  SWR_DEDUPE_INTERVAL: 5000,

  /** SWR cache TTL in milliseconds (5 minutes) */
  SWR_CACHE_TTL: 5 * 60 * 1000,

  /** Maximum retry attempts for failed requests */
  MAX_RETRIES: 3,

  /** Base delay for exponential backoff (ms) */
  RETRY_BASE_DELAY: 1000,

  /** Session storage key */
  SESSION_KEY: 'feedfront:session',

  /** Preferences storage key */
  PREFERENCES_KEY: 'feedfront:preferences',

  /** Metrics/sync storage key */
  METRICS_KEY: 'feedfront:metrics',

  /** User-Agent header for API requests */
  USER_AGENT: 'Feedfront/1.0',
} as const;

/**
 * Error messages for common scenarios (FR-012: actionable copy).
 */
export const ERROR_MESSAGES = {
  INVALID_URL: 'Please enter a valid server URL.',
  INSECURE_URL: 'Server URL must use HTTPS for security. Only localhost is allowed over HTTP.',
  INVALID_CREDENTIALS: 'Invalid username or password. Please check your credentials.',
  NETWORK_ERROR: 'Unable to connect to the server. Please check your internet connection.',
  CORS_ERROR:
    'Unable to connect. The server may not allow cross-origin requests. Contact your administrator.',
  SERVER_ERROR: 'The server encountered an error. Please try again later.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  OFFLINE: 'You are currently offline. Some features may be unavailable.',
  NOT_FOUND: 'The requested resource was not found.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
} as const;
