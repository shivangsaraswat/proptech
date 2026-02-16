import { STORAGE_KEYS } from "./constants";

/**
 * Get auth token from Zustand persisted state
 * The token is stored in the Zustand auth store, persisted under STORAGE_KEYS.USER
 * The persisted structure is: { state: { user, token, isAuthenticated }, version: 0 }
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

/**
 * Remove auth data from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEYS.USER);
  // Also clean up legacy key if it exists
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
