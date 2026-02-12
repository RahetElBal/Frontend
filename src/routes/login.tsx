import { useTranslation } from "react-i18next";
import { Phone } from "lucide-react";

import { AuthLayout } from "@/layouts/auth-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/spinner";
import { useAuthentication } from "@/hooks/useAuthentication";
import { useUser } from "@/hooks/useUser";
import { CONTACT_INFO } from "@/constants/auth";

// Google Icon SVG
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function LoginPage() {
  const { t } = useTranslation();
  const { isLoading, error, loginWithGoogle } = useAuthentication();

  // Redirect if already authenticated
  useUser({ redirectIfFound: true });

  const getErrorMessage = (errorKey: string): string => {
    switch (errorKey) {
      case "cancelled":
        return t("auth.login.error.cancelled");
      case "popup":
        return t("auth.login.error.popup");
      default:
        return t("auth.login.error.generic");
    }
  };

  return (
    <AuthLayout>
      <Card
        className="border-0 !bg-transparent shadow-none"
        style={{ background: "transparent" }}
      >
        <CardHeader className="text-center space-y-2 pb-2">
          {/* Brand logo */}
          <div className="mx-auto mb-4 flex items-center justify-center">
            <img
              src="/branding/beautiq-logo.svg"
              alt="Beautiq logo"
              className="h-14 w-auto object-contain"
              decoding="async"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {t("auth.login.title")}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {t("auth.login.subtitle")}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          {/* Error message */}
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm text-center">
              {getErrorMessage(error)}
            </div>
          )}

          {/* Google Sign In Button */}
          <Button
            variant="outline"
            size="lg"
            className="w-full h-12 text-base font-medium border-2 border-accent-pink-100 bg-linear-to-br from-accent-pink-50 to-accent-blue-50 text-gray-900 shadow-sm transition-all duration-200 hover:from-accent-pink-100 hover:to-accent-blue-100"
            onClick={loginWithGoogle}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner size="sm" />
                <span>{t("auth.login.loading")}</span>
              </>
            ) : (
              <>
                <GoogleIcon className="w-5 h-5" />
                <span>{t("auth.login.googleButton")}</span>
              </>
            )}
          </Button>
        </CardContent>

        <CardFooter className="flex flex-col items-center gap-4 pt-2 pb-6">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            {t("auth.login.contactUs")}
          </span>

          {/* Contact Info */}
          <a
            href={`tel:${CONTACT_INFO.PHONE.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent-pink-500 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>{t("auth.login.phoneLabel")}:</span>
            <span className="font-medium text-foreground">
              {CONTACT_INFO.PHONE}
            </span>
          </a>
        </CardFooter>
      </Card>
    </AuthLayout>
  );
}
