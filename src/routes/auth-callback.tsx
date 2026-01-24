import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthProvider';
import { useSalon } from '@/contexts/SalonProvider';
import { AUTH_STORAGE_KEY, AUTH_ROUTES } from '@/constants/auth';
import { get } from '@/lib/http';
import { Spinner } from '@/components/spinner';
import type { AuthUser } from '@/types/user';

/**
 * OAuth callback page that handles the token from backend
 * The backend redirects here with ?token=xxx after successful Google OAuth
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const { refreshSalons } = useSalon();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const processedRef = useRef(false);

  const navigateByRole = useCallback((user: AuthUser) => {
    // Superadmin or admin goes to admin panel
    if (user.isSuperadmin || user.role === 'superadmin' || user.role === 'admin') {
      navigate(AUTH_ROUTES.ADMIN_DASHBOARD, { replace: true });
    } else {
      // Regular user goes to dashboard
      navigate(AUTH_ROUTES.DASHBOARD, { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent double processing (React StrictMode or re-renders)
      if (processedRef.current) {
        return;
      }
      processedRef.current = true;

      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const errorParam = urlParams.get('error');

      // Clean URL immediately
      window.history.replaceState({}, document.title, window.location.pathname);

      if (errorParam) {
        setError(decodeURIComponent(errorParam));
        setIsProcessing(false);
        setTimeout(() => {
          navigate(AUTH_ROUTES.LOGIN, { replace: true });
        }, 3000);
        return;
      }

      if (!token) {
        // Check if we already have a token (page refresh)
        const existingToken = localStorage.getItem(AUTH_STORAGE_KEY);
        const existingUser = localStorage.getItem('user');
        
        if (existingToken && existingUser) {
          try {
            const user = JSON.parse(existingUser) as AuthUser;
            navigateByRole(user);
            return;
          } catch {
            // Invalid stored user, continue to login
          }
        }
        
        setError('No authentication token received');
        setIsProcessing(false);
        setTimeout(() => {
          navigate(AUTH_ROUTES.LOGIN, { replace: true });
        }, 3000);
        return;
      }

      try {
        // Save token first
        localStorage.setItem(AUTH_STORAGE_KEY, token);

        // Fetch user data with retry
        let user: AuthUser | null = null;
        let retries = 3;
        
        while (retries > 0 && !user) {
          try {
            user = await get<AuthUser>('auth/me');
          } catch (err) {
            retries--;
            if (retries > 0) {
              // Wait a bit before retrying
              await new Promise(resolve => setTimeout(resolve, 500));
            } else {
              throw err;
            }
          }
        }

        if (!user) {
          throw new Error('Failed to fetch user data');
        }
        
        // Login with user data
        login(user, token);

        // Refresh salons for non-superadmin users
        const isSuperadmin = user.isSuperadmin || user.role === 'superadmin';
        if (!isSuperadmin) {
          await refreshSalons();
        }

        // Redirect based on role
        navigateByRole(user);
      } catch (err) {
        console.error('Auth callback error:', err);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem('user');
        setError('Failed to authenticate. Please try again.');
        setIsProcessing(false);
        setTimeout(() => {
          navigate(AUTH_ROUTES.LOGIN, { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, login, navigateByRole]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-blue-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
        <Spinner className="w-12 h-12 mx-auto mb-4 text-pink-500" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isProcessing ? 'Authenticating...' : 'Redirecting...'}
        </h1>
        <p className="text-gray-600">Please wait while we complete your sign in.</p>
      </div>
    </div>
  );
}
