import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AppRole } from "@/constants/enum";
import { useAuthContext } from "@/contexts/AuthProvider";
import { AUTH_STORAGE_KEY, AUTH_ROUTES } from "@/constants/auth";
import { get } from "@/lib/http";
import { Spinner } from "@/components/spinner";
import type { AuthUser } from "@/types/user";

const MOBILE_APP_CALLBACK = "beautiq://auth/callback";

type MobileRedirectState = {
  appUrl: string;
  token: string;
};

const isLikelyMobileBrowser = () => {
  const userAgent = navigator.userAgent || "";
  return /Android|iPhone|iPad|iPod/i.test(userAgent);
};

const buildAppRedirectUrl = (
  base: string,
  params: Record<string, string>,
): string => {
  try {
    const url = new URL(base);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  } catch {
    const search = new URLSearchParams(params).toString();
    if (!search) return base;
    const joiner = base.includes("?") ? "&" : "?";
    return `${base}${joiner}${search}`;
  }
};

/**
 * OAuth callback page that handles both:
 * - Web sign-in completion
 * - Mobile fallback (browser page can reopen the app via deep link)
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [mobileRedirect, setMobileRedirect] = useState<MobileRedirectState | null>(
    null,
  );
  const processedRef = useRef(false);

  const navigateByRole = useCallback(
    (user: AuthUser) => {
      if (
        user.isSuperadmin ||
        user.role === AppRole.SUPER_ADMIN ||
        user.role === AppRole.ADMIN
      ) {
        navigate(AUTH_ROUTES.ADMIN_DASHBOARD, { replace: true });
      } else {
        navigate(AUTH_ROUTES.DASHBOARD, { replace: true });
      }
    },
    [navigate],
  );

  const completeWebAuthentication = useCallback(
    async (token: string) => {
      localStorage.setItem(AUTH_STORAGE_KEY, token);

      let user: AuthUser | null = null;
      let retries = 3;

      while (retries > 0 && !user) {
        try {
          user = await get<AuthUser>("auth/me");
        } catch (err) {
          retries -= 1;
          if (retries > 0) {
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
        throw new Error(
          "Your account has been deactivated. Please contact your administrator.",
        );
      }

      login(user, token);
      await new Promise((resolve) => setTimeout(resolve, 100));
      navigateByRole(user);
    },
    [login, navigateByRole],
  );

  const handleContinueOnWeb = useCallback(() => {
    if (!mobileRedirect) return;

    setMobileRedirect(null);
    setIsProcessing(true);
    setError(null);

    void completeWebAuthentication(mobileRedirect.token).catch((err) => {
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
    });
  }, [mobileRedirect, completeWebAuthentication, navigate]);

  useEffect(() => {
    const handleCallback = async () => {
      if (processedRef.current) return;
      processedRef.current = true;

      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const errorParam = urlParams.get("error");
      const explicitWebFlow = urlParams.get("web") === "1";
      const appRedirectBase =
        urlParams.get("appRedirect") || MOBILE_APP_CALLBACK;

      if (errorParam) {
        const decodedError = decodeURIComponent(errorParam);
        window.history.replaceState({}, document.title, window.location.pathname);
        setError(decodedError);
        setIsProcessing(false);
        setTimeout(() => {
          navigate(AUTH_ROUTES.LOGIN, { replace: true });
        }, 4000);
        return;
      }

      window.history.replaceState({}, document.title, window.location.pathname);

      if (!token) {
        const existingToken = localStorage.getItem(AUTH_STORAGE_KEY);
        const existingUser = localStorage.getItem("user");

        if (existingToken && existingUser) {
          try {
            const user = JSON.parse(existingUser) as AuthUser;
            navigateByRole(user);
            return;
          } catch {
            // Invalid stored user, continue to login.
          }
        }

        setError("No authentication token received");
        setIsProcessing(false);
        setTimeout(() => {
          navigate(AUTH_ROUTES.LOGIN, { replace: true });
        }, 3000);
        return;
      }

      const shouldRedirectBackToApp =
        !explicitWebFlow && isLikelyMobileBrowser();

      if (shouldRedirectBackToApp) {
        const appUrl = buildAppRedirectUrl(appRedirectBase, { token });
        setMobileRedirect({ appUrl, token });
        setIsProcessing(false);

        // Auto-attempt deep link first.
        window.location.assign(appUrl);
        return;
      }

      try {
        await completeWebAuthentication(token);
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

    void handleCallback();
  }, [navigate, navigateByRole, completeWebAuthentication]);

  if (mobileRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-accent-pink-50 to-accent-blue-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md border border-accent-pink-100">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication successful
          </h1>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Returning to the Beautiq app. If it does not open automatically, use
            the button below.
          </p>

          <a
            href={mobileRedirect.appUrl}
            className="inline-flex items-center justify-center w-full h-11 rounded-xl bg-linear-to-r from-accent-pink-500 to-accent-blue-500 text-white font-semibold shadow-sm hover:opacity-95 transition"
          >
            Open Beautiq app
          </a>

          <button
            type="button"
            onClick={handleContinueOnWeb}
            className="mt-3 text-sm text-gray-500 hover:text-gray-700 transition"
          >
            Continue on web instead
          </button>
        </div>
      </div>
    );
  }

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
            Access denied
          </h1>
          <p className="text-gray-600 mb-4 leading-relaxed">{error}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Redirecting to login...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-accent-pink-50 to-accent-blue-50">
      <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
        <Spinner className="w-12 h-12 mx-auto mb-4 text-accent-pink-500" />
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
