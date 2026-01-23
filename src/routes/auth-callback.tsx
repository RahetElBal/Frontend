import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts/AuthProvider';
import { AUTH_STORAGE_KEY, AUTH_ROUTES } from '@/constants/auth';
import { get } from '@/lib/http';
import { Spinner } from '@/components/spinner';
import type { User } from '@/types/entities';

/**
 * OAuth callback page that handles the token from backend
 * The backend redirects here with ?token=xxx after successful Google OAuth
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const errorParam = urlParams.get('error');

      if (errorParam) {
        setError(decodeURIComponent(errorParam));
        setTimeout(() => {
          navigate(AUTH_ROUTES.LOGIN);
        }, 3000);
        return;
      }

      if (!token) {
        setError('No authentication token received');
        setTimeout(() => {
          navigate(AUTH_ROUTES.LOGIN);
        }, 3000);
        return;
      }

      try {
        // Save token first
        localStorage.setItem(AUTH_STORAGE_KEY, token);

        // Fetch user data
        const user = await get<User>('auth/me');
        
        // Login with user data
        login(user, token);

        // Redirect based on role
        if (user.role === 'admin') {
          navigate(AUTH_ROUTES.ADMIN_DASHBOARD);
        } else {
          navigate(AUTH_ROUTES.DASHBOARD);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        setError('Failed to authenticate. Please try again.');
        setTimeout(() => {
          navigate(AUTH_ROUTES.LOGIN);
        }, 3000);
      }
    };

    handleCallback();
  }, [navigate, login]);

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Authenticating...</h1>
        <p className="text-gray-600">Please wait while we complete your sign in.</p>
      </div>
    </div>
  );
}
