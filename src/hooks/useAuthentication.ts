import { useState, useCallback } from "react";
import { useAuthContext } from "@/contexts/AuthProvider";
import { AUTH_STORAGE_KEY } from "@/constants/auth";
import { get } from "@/lib/http";
import type { User } from "@/types/entities";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface UseAuthenticationReturn {
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: () => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

/**
 * Hook for regular user/admin authentication
 */
export function useAuthentication(): UseAuthenticationReturn {
  const { logout: contextLogout, updateUser } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithGoogle = useCallback(() => {
    setIsLoading(true);
    setError(null);

    // Regular user OAuth flow
    window.location.href = `${API_BASE_URL}/auth/google`;
  }, []);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!token) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const user = await get<User>("auth/me");
      // Ensure isSuperadmin has a boolean value for AuthUser compatibility
      updateUser({ ...user, isSuperadmin: user.isSuperadmin ?? false });
    } catch (err) {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem("user");
      console.error("Auth check failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, [updateUser]);

  const logout = useCallback(() => {
    contextLogout();
  }, [contextLogout]);

  return {
    isLoading,
    error,
    loginWithGoogle,
    logout,
    checkAuth,
  };
}
