import { useState, useCallback, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthProvider';
import { AUTH_STORAGE_KEY } from '@/constants/auth';
import { get } from '@/lib/http';
import type { User } from '@/types/entities';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface UseAuthenticationReturn {
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: () => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

/**
 * Hook for handling authentication with Google OAuth via backend
 * 
 * @example
 * const { loginWithGoogle, logout, isLoading } = useAuthentication();
 * 
 * // Trigger Google OAuth login
 * <Button onClick={loginWithGoogle}>Sign in with Google</Button>
 */
export function useAuthentication(): UseAuthenticationReturn {
  const { login, logout: contextLogout, updateUser } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initiates Google OAuth flow by redirecting to backend
   */
  const loginWithGoogle = useCallback(() => {
    setIsLoading(true);
    setError(null);
    
    // Redirect to backend's Google OAuth endpoint
    // The backend will redirect to Google, then back to our callback URL with the token
    window.location.href = `${API_BASE_URL}/auth/google`;
  }, []);

  /**
   * Checks if there's a valid auth token and fetches user data
   */
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem(AUTH_STORAGE_KEY);
    
    if (!token) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch current user from backend
      const user = await get<User>('auth/me');
      updateUser(user);
    } catch (err) {
      // Token is invalid, clear it
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('user');
      console.error('Auth check failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [updateUser]);

  /**
   * Logs out the user
   */
  const logout = useCallback(() => {
    contextLogout();
  }, [contextLogout]);

  /**
   * Handle OAuth callback - check URL for token on mount
   */
  useEffect(() => {
    const handleCallback = () => {
      // Check URL params for token (from backend OAuth callback)
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const userParam = urlParams.get('user');

      if (token) {
        // Save token
        localStorage.setItem(AUTH_STORAGE_KEY, token);
        
        // Parse and save user if provided
        if (userParam) {
          try {
            const user = JSON.parse(decodeURIComponent(userParam));
            login(user, token);
          } catch {
            // If user parsing fails, fetch from API
            checkAuth();
          }
        } else {
          // Fetch user from API
          checkAuth();
        }
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        // Check existing auth
        checkAuth();
      }
    };

    handleCallback();
  }, [login, checkAuth]);

  return {
    isLoading,
    error,
    loginWithGoogle,
    logout,
    checkAuth,
  };
}
