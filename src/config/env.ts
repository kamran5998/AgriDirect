/**
 * Environment configuration for the AgriDirect Pulse frontend.
 * Directs all API requests to the Python FastAPI backend service.
 */

// Safe access for Vite environment variables
const getEnvVar = (key: string, defaultValue: string): string => {
  try {
    // Check import.meta.env if defined
    const metaEnv = (import.meta as any)?.env;
    if (metaEnv && typeof metaEnv[key] === 'string') {
      return metaEnv[key];
    }
  } catch {
    // Fallback to default in non-standard runtimes
  }
  return defaultValue;
};

export const ENV = {
  // Backend REST API base URL
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL', '/api'),
  
  // App environment
  NODE_ENV: getEnvVar('MODE', 'development'),
  IS_DEV: true,
  IS_PROD: false,
  
  // API Timeout in milliseconds (default: 30s)
  API_TIMEOUT_MS: 30000,
  
  // Auth Token Storage Keys
  STORAGE_AUTH_TOKEN_KEY: 'agridirect_auth_token',
  STORAGE_USER_KEY: 'agridirect_user_profile',
  STORAGE_ROLE_KEY: 'agridirect_user_role',
} as const;
