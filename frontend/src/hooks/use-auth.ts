import { useAuthStore } from "../stores/auth-store";
import { removeAuthToken, setAuthToken as setToken } from "../lib/auth";

import type { User } from "../types/auth";

/**
 * Auth hook for accessing auth state and actions
 */
export function useAuth() {
  const { user, token, isAuthenticated, setAuth, clearAuth, updateUser } = useAuthStore();

  const login = (userData: User, authToken: string) => {
    setToken(authToken);
    setAuth(userData, authToken);
  };

  const logout = () => {
    removeAuthToken();
    clearAuth();
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };
}
