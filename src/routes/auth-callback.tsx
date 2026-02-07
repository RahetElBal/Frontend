import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthProvider";
import { AUTH_STORAGE_KEY, AUTH_ROUTES } from "@/constants/auth";
import { get } from "@/lib/http";
import { Spinner } from "@/components/spinner";
import type { AuthUser } from "@/types/user";

/**
 * OAuth callback page that handles the token from backend
 * The backend redirects here with ?token=xxx after successful Google OAuth
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const processedRef = useRef(false);

  const navigateByRole = useCallback(
    (user: AuthUser) => {
      // Superadmin or admin goes to admin panel
      if (
        user.isSuperadmin ||
        user.role === "superadmin" ||
        user.role === "admin"
      ) {
        navigate(AUTH_ROUTES.ADMIN_DASHBOARD, { replace: true });
      } else {
        // Regular user goes to dashboard
        navigate(AUTH_ROUTES.DASHBOARD, { replace: true });
      }
    },
    [navigate],
  );

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent double processing (React StrictMode or re-renders)
      if (processedRef.current) {
        return;
      }
      processedRef.current = true;

      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const errorParam = urlParams.get("error");

      // Handle error from backend (e.g., access denied)
      if (errorParam) {
        const decodedError = decodeURIComponent(errorParam);
        // Clean URL after reading params
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        setError(decodedError);
        setIsProcessing(false);
        setTimeout(() => {
          navigate(AUTH_ROUTES.LOGIN, { replace: true });
        }, 4000); // Show error for 4 seconds
        return;
      }

      // Clean URL for non-error cases
      window.history.replaceState({}, document.title, window.location.pathname);

      if (!token) {
        // Check if we already have a token (page refresh)
        const existingToken = localStorage.getItem(AUTH_STORAGE_KEY);
        const existingUser = localStorage.getItem("user");

        if (existingToken && existingUser) {
          try {
            const user = JSON.parse(existingUser) as AuthUser;
            navigateByRole(user);
            return;
          } catch {
            // Invalid stored user, continue to login
          }
        }

        setError("No authentication token received");
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
            user = await get<AuthUser>("auth/me");
          } catch (err) {
            retries--;
            if (retries > 0) {
              // Wait a bit before retrying
              await new Promise((resolve) => setTimeout(resolve, 500));
            } else {
              throw err;
            }
          }
        }

        if (!user) {
          throw new Error("Failed to fetch user data");
        }

        if ((user as AuthUser & { isActive?: boolean }).isActive === false) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          localStorage.removeItem("user");
          setError("Your account has been deactivated. Please contact your administrator.");
          setIsProcessing(false);
          setTimeout(() => {
            navigate(AUTH_ROUTES.LOGIN, { replace: true });
          }, 4000);
          return;
        }

        // Login with user data
        login(user, token);

        // Small delay to ensure state is updated before navigation
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Redirect based on role
        navigateByRole(user);
      } catch (err) {
        console.error("Auth callback error:", err);
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem("user");
        const message =
          (err as { message?: string })?.message ||
          "Failed to authenticate. Please try again.";
        setError(message);
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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-red-50 to-orange-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md border border-red-100">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Accès refusé
          </h1>
          <p className="text-gray-600 mb-4 leading-relaxed">{error}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Redirection vers la page de connexion...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-pink-50 to-blue-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
        <Spinner className="w-12 h-12 mx-auto mb-4 text-pink-500" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {isProcessing ? "Authenticating..." : "Redirecting..."}
        </h1>
        <p className="text-gray-600">
          Please wait while we complete your sign in.
        </p>
      </div>
    </div>
  );
}
