const RAW_API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const RAW_MEDIA_BASE_URL = import.meta.env.VITE_MEDIA_URL;
const FALLBACK_ORIGIN = "http://localhost:3000";

const SCHEME_RE = /^[a-zA-Z][a-zA-Z\\d+-.]*:/;

const normalizeApiBaseUrl = (baseUrl: string) => baseUrl.replace(/\/$/, "");
const normalizeMediaBaseUrl = (baseUrl: string) =>
  baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

const API_BASE_URL = normalizeApiBaseUrl(RAW_API_BASE_URL);
const MEDIA_BASE_URL = RAW_MEDIA_BASE_URL
  ? normalizeMediaBaseUrl(RAW_MEDIA_BASE_URL)
  : API_BASE_URL;

export function getMediaBaseUrl(): string {
  const browserOrigin =
    typeof window !== "undefined" ? window.location.origin : undefined;

  try {
    return new URL(MEDIA_BASE_URL, browserOrigin).toString();
  } catch {
    return browserOrigin || MEDIA_BASE_URL || FALLBACK_ORIGIN;
  }
}

export function resolveMediaUrl(pathOrUrl?: string | null): string | undefined {
  if (!pathOrUrl) return undefined;

  if (pathOrUrl.startsWith("//")) return pathOrUrl;

  // Already absolute (http:, https:, blob:, data:, etc.)
  if (SCHEME_RE.test(pathOrUrl)) return pathOrUrl;

  const base = getMediaBaseUrl();
  try {
    return new URL(pathOrUrl, base).toString();
  } catch {
    const normalizedBase = base.replace(/\/$/, "");
    const normalizedPath = pathOrUrl.startsWith("/")
      ? pathOrUrl
      : `/${pathOrUrl}`;
    return `${normalizedBase}${normalizedPath}`;
  }
}
