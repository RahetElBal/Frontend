import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Download, ExternalLink, ShieldCheck, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/navigation";
import { AUTH_STORAGE_KEY } from "@/constants/auth";
import { API_BASE_URL } from "@/lib/http";

type DownloadMode = "direct" | "signed_url";

type MobileAppManifest = {
  generatedAt: string;
  android: {
    available: boolean;
    version: string;
    buildNumber: string;
    sizeBytes: number | null;
    checksumSha256: string | null;
    downloadMode: DownloadMode;
    downloadUrl: string | null;
    downloadTokenEndpoint: string | null;
    releaseNotes: string | null;
  };
  ios: {
    testFlightUrl: string | null;
    mdmUrl: string | null;
    enterprisePortalUrl: string | null;
    note: string;
  };
};

type DownloadTokenResponse = {
  mode: DownloadMode;
  downloadUrl: string;
  expiresAt: string | null;
};

const formatBytes = (value: number | null): string => {
  if (!value || value <= 0) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let nextValue = value;
  let index = 0;
  while (nextValue >= 1024 && index < units.length - 1) {
    nextValue /= 1024;
    index += 1;
  }
  return `${nextValue.toFixed(index === 0 ? 0 : 2)} ${units[index]}`;
};

export default function MobileAppDownloadPage() {
  const [manifest, setManifest] = useState<MobileAppManifest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPreparingDownload, setIsPreparingDownload] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const apiBase = useMemo(() => API_BASE_URL.replace(/\/$/, ""), []);
  const isAuthenticated = useMemo(
    () => Boolean(localStorage.getItem(AUTH_STORAGE_KEY)),
    [],
  );

  useEffect(() => {
    let isMounted = true;
    const loadManifest = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetch(`${apiBase}/mobile-app/manifest`);
        if (!response.ok) {
          throw new Error(`Manifest request failed (${response.status})`);
        }
        const data = (await response.json()) as MobileAppManifest;
        if (isMounted) {
          setManifest(data);
        }
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load mobile app download information.",
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadManifest();
    return () => {
      isMounted = false;
    };
  }, [apiBase]);

  const startAndroidDownload = useCallback(async () => {
    if (!manifest?.android?.available) return;
    setDownloadError(null);

    if (manifest.android.downloadMode === "direct") {
      if (!manifest.android.downloadUrl) {
        setDownloadError("Direct download URL is not configured.");
        return;
      }
      window.location.href = manifest.android.downloadUrl;
      return;
    }

    const authToken = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!authToken) {
      setDownloadError(
        "Sign in is required to generate a secure APK download link.",
      );
      return;
    }

    try {
      setIsPreparingDownload(true);
      const response = await fetch(`${apiBase}/mobile-app/android/download-token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Download token request failed (${response.status})`);
      }

      const data = (await response.json()) as DownloadTokenResponse;
      if (!data?.downloadUrl) {
        throw new Error("Download URL is missing from token response.");
      }
      window.location.href = data.downloadUrl;
    } catch (error) {
      setDownloadError(
        error instanceof Error
          ? error.message
          : "Unable to prepare secure download link.",
      );
    } finally {
      setIsPreparingDownload(false);
    }
  }, [apiBase, manifest]);

  const iosLinks = useMemo(
    () =>
      [
        { label: "TestFlight", href: manifest?.ios?.testFlightUrl },
        { label: "MDM Portal", href: manifest?.ios?.mdmUrl },
        { label: "Enterprise Portal", href: manifest?.ios?.enterprisePortalUrl },
      ].filter((item) => Boolean(item.href)),
    [manifest],
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-accent-pink-50 via-background to-accent-blue-50 text-foreground">
      <main className="mx-auto w-full max-w-4xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent-pink-200 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-pink-500">
            <Smartphone className="h-4 w-4" />
            Mobile App Distribution
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Download Beautiq Mobile App
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Android APK distribution for your B2B clients with checksum and
            secure-link support. For iOS, use TestFlight, MDM, or enterprise
            distribution.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link to={ROUTES.HOME}>Back to website</Link>
            </Button>
            {!isAuthenticated ? (
              <Button asChild size="sm">
                <Link to={ROUTES.LOGIN}>
                  Sign in to download securely
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : null}
          </div>
        </header>

        {isLoading ? (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Loading distribution info...</p>
          </Card>
        ) : null}

        {errorMessage ? (
          <Card className="border-red-200 bg-red-50 p-6">
            <p className="font-medium text-red-700">Unable to load distribution data</p>
            <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
          </Card>
        ) : null}

        {manifest ? (
          <>
            <Card className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Android (APK)</h2>
                  <p className="text-sm text-muted-foreground">
                    Version {manifest.android.version} (build {manifest.android.buildNumber})
                  </p>
                </div>
                <Button
                  onClick={() => void startAndroidDownload()}
                  disabled={!manifest.android.available || isPreparingDownload}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isPreparingDownload ? "Preparing..." : "Download APK"}
                </Button>
              </div>

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <p>
                  <span className="text-muted-foreground">Availability:</span>{" "}
                  <span className="font-medium">
                    {manifest.android.available ? "Available" : "Not available"}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Download mode:</span>{" "}
                  <span className="font-medium">
                    {manifest.android.downloadMode === "signed_url"
                      ? "Signed secure link"
                      : "Direct"}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">File size:</span>{" "}
                  <span className="font-medium">{formatBytes(manifest.android.sizeBytes)}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Manifest updated:</span>{" "}
                  <span className="font-medium">
                    {new Date(manifest.generatedAt).toLocaleString()}
                  </span>
                </p>
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  SHA-256
                </p>
                <p className="mt-1 break-all font-mono text-xs sm:text-sm">
                  {manifest.android.checksumSha256 || "-"}
                </p>
              </div>

              {manifest.android.releaseNotes ? (
                <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Release notes
                  </p>
                  <p className="mt-1 text-sm">{manifest.android.releaseNotes}</p>
                </div>
              ) : null}

              {downloadError ? (
                <p className="text-sm font-medium text-red-600">{downloadError}</p>
              ) : null}
            </Card>

            <Card className="space-y-4 p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-accent-blue-500" />
                <h2 className="text-xl font-semibold">iOS Distribution</h2>
              </div>
              <p className="text-sm text-muted-foreground">{manifest.ios.note}</p>

              {iosLinks.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {iosLinks.map((item) => (
                    <Button
                      asChild
                      key={item.label}
                      variant="outline"
                      size="sm"
                      className="gap-2"
                    >
                      <a href={item.href as string} target="_blank" rel="noreferrer">
                        {item.label}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Configure `MOBILE_IOS_TESTFLIGHT_URL`, `MOBILE_IOS_MDM_URL`, or
                  `MOBILE_IOS_ENTERPRISE_PORTAL_URL` in backend environment to expose links here.
                </p>
              )}
            </Card>
          </>
        ) : null}
      </main>
    </div>
  );
}

