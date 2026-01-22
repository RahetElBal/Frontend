import { useState, useCallback } from 'react';
import { useAuthContext } from '@/contexts/AuthProvider';
import { GOOGLE_OAUTH } from '@/constants/auth';
import type { User } from '@/types/user';
import { UserRole } from '@/types/user';

interface GoogleAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture: string;
}

interface UseAuthenticationReturn {
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
}

export function useAuthentication(): UseAuthenticationReturn {
  const { login, logout } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Build OAuth URL
      const params = new URLSearchParams({
        client_id: GOOGLE_OAUTH.CLIENT_ID,
        redirect_uri: GOOGLE_OAUTH.REDIRECT_URI,
        response_type: 'token',
        scope: GOOGLE_OAUTH.SCOPE,
        prompt: 'select_account',
      });

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

      // Open popup for OAuth
      const popup = window.open(
        authUrl,
        'google-oauth',
        'width=500,height=600,scrollbars=yes'
      );

      if (!popup) {
        throw new Error('popup');
      }

      // Listen for OAuth callback
      const authResponse = await new Promise<GoogleAuthResponse>(
        (resolve, reject) => {
          const checkPopup = setInterval(() => {
            try {
              if (popup.closed) {
                clearInterval(checkPopup);
                reject(new Error('cancelled'));
                return;
              }

              // Check if we're back on our domain
              if (popup.location.origin === window.location.origin) {
                const hash = popup.location.hash.substring(1);
                const params = new URLSearchParams(hash);
                const accessToken = params.get('access_token');

                if (accessToken) {
                  clearInterval(checkPopup);
                  popup.close();
                  resolve({
                    access_token: accessToken,
                    token_type: params.get('token_type') || 'Bearer',
                    expires_in: parseInt(params.get('expires_in') || '3600', 10),
                  });
                }
              }
            } catch {
              // Cross-origin error - popup is still on Google's domain
            }
          }, 500);

          // Timeout after 5 minutes
          setTimeout(() => {
            clearInterval(checkPopup);
            popup.close();
            reject(new Error('cancelled'));
          }, 300000);
        }
      );

      // Fetch user info from Google
      const userInfoResponse = await fetch(
        'https://www.googleapis.com/oauth2/v2/userinfo',
        {
          headers: {
            Authorization: `Bearer ${authResponse.access_token}`,
          },
        }
      );

      if (!userInfoResponse.ok) {
        throw new Error('generic');
      }

      const googleUser: GoogleUserInfo = await userInfoResponse.json();

      // Transform to our User type
      // In production, this would be handled by the backend
      // which would determine the role based on the user's email/database
      const user: User = {
        id: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        role: determineUserRole(googleUser.email),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      login(user, authResponse.access_token);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'generic';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [login]);

  return {
    isLoading,
    error,
    loginWithGoogle,
    logout,
  };
}

// Mock function to determine user role
// In production, this would come from the backend
function determineUserRole(email: string): UserRole {
  // Admin emails (for demo purposes)
  const adminEmails = ['admin@beautysalon.com'];
  return adminEmails.includes(email) ? UserRole.ADMIN : UserRole.USER;
}
