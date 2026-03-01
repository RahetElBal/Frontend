import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Download, ExternalLink, ShieldCheck, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/constants/navigation";
import { AUTH_STORAGE_KEY } from "@/constants/auth";
import { API_BASE_URL } from "@/lib/http";

const STATIC_APK_URL = "/downloads/app-release.apk";
const STATIC_APK_VERSION = "1.0.0";
const STATIC_APK_BUILD = "1";
const STATIC_APK_SIZE_BYTES = 29367304;
const STATIC_APK_SHA256 =
  "53f5ae3917aa6d6c3c0e7d0977ffc9506df46d790696bda8c92cfa485958cc74";
const STATIC_APK_RELEASE_NOTES = "Production release";

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
      } catch {
        if (isMounted) {
          setErrorMessage("API manifest unavailable");
        }
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

  const androidVersion = manifest?.android?.version ?? STATIC_APK_VERSION;
  const androidBuild = manifest?.android?.buildNumber ?? STATIC_APK_BUILD;
  const androidSize = manifest?.android?.sizeBytes ?? STATIC_APK_SIZE_BYTES;
  const androidSha = manifest?.android?.checksumSha256 ?? STATIC_APK_SHA256;
  const androidNotes = manifest?.android?.releaseNotes ?? STATIC_APK_RELEASE_NOTES;
  const androidAvailable = manifest?.android?.available ?? true;

  const startAndroidDownload = useCallback(async () => {
    setDownloadError(null);

    if (!manifest?.android?.available) {
      window.location.href = STATIC_APK_URL;
      return;
    }

    if (manifest.android.downloadMode === "direct") {
      if (manifest.android.downloadUrl) {
        window.location.href = manifest.android.downloadUrl;
      } else {
        window.location.href = STATIC_APK_URL;
      }
      return;
    }

    const authToken = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!authToken) {
      window.location.href = STATIC_APK_URL;
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
    } catch {
      window.location.href = STATIC_APK_URL;
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

  const iosNote =
    manifest?.ios?.note ??
    "iOS website sideloading is not supported. Use TestFlight, MDM, or enterprise distribution.";

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

        {!isLoading ? (
          <>
            <Card className="space-y-5 p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">Android (APK)</h2>
                  <p className="text-sm text-muted-foreground">
                    Version {androidVersion} (build {androidBuild})
                  </p>
                </div>
                <Button
                  onClick={() => void startAndroidDownload()}
                  disabled={!androidAvailable || isPreparingDownload}
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
                    {androidAvailable ? "Available" : "Not available"}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">Download mode:</span>{" "}
                  <span className="font-medium">
                    {manifest?.android?.downloadMode === "signed_url"
                      ? "Signed secure link"
                      : "Direct"}
                  </span>
                </p>
                <p>
                  <span className="text-muted-foreground">File size:</span>{" "}
                  <span className="font-medium">{formatBytes(androidSize)}</span>
                </p>
                {manifest ? (
                  <p>
                    <span className="text-muted-foreground">Manifest updated:</span>{" "}
                    <span className="font-medium">
                      {new Date(manifest.generatedAt).toLocaleString()}
                    </span>
                  </p>
                ) : null}
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  SHA-256
                </p>
                <p className="mt-1 break-all font-mono text-xs sm:text-sm">
                  {androidSha || "-"}
                </p>
              </div>

              {androidNotes ? (
                <div className="rounded-xl border border-border/80 bg-muted/20 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Release notes
                  </p>
                  <p className="mt-1 text-sm">{androidNotes}</p>
                </div>
              ) : null}

              {downloadError ? (
                <p className="text-sm font-medium text-red-600">{downloadError}</p>
              ) : null}

              {errorMessage ? (
                <div className="flex items-center gap-3 rounded-lg border border-accent-pink-200 bg-accent-pink-50 p-3">
                  <p className="text-xs text-muted-foreground">
                    API manifest unavailable — using bundled APK.
                  </p>
                  <Button asChild variant="outline" size="sm" className="ml-auto shrink-0 gap-2">
                    <a href={STATIC_APK_URL} download="app-release.apk">
                      <Download className="h-3 w-3" />
                      Direct download
                    </a>
                  </Button>
                </div>
              ) : null}
            </Card>

            <Card className="space-y-4 p-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-accent-blue-500" />
                <h2 className="text-xl font-semibold">iOS Distribution</h2>
              </div>
              <p className="text-sm text-muted-foreground">{iosNote}</p>

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

