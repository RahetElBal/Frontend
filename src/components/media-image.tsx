import * as React from "react";
import { resolveMediaUrl, getMediaBaseUrl } from "@/lib/media";
import { AUTH_STORAGE_KEY } from "@/constants/auth";

type MediaImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src"
> & {
  src?: string | null;
  fallbackSrc: string;
};

const isSkippableScheme = (value: string) =>
  value.startsWith("blob:") || value.startsWith("data:");

const getOrigin = (value: string) => {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
};

const getBaseDomain = (hostname: string) => {
  const parts = hostname.split(".").filter(Boolean);
  if (parts.length <= 2) return hostname;
  return parts.slice(-2).join(".");
};

const isOriginTrusted = (
  origin: string,
  trustedOrigins: Set<string>,
  baseDomain?: string | null,
) => {
  if (trustedOrigins.has(origin)) return true;
  if (!baseDomain) return false;
  try {
    const host = new URL(origin).hostname;
    return host === baseDomain || host.endsWith(`.${baseDomain}`);
  } catch {
    return false;
  }
};

const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(AUTH_STORAGE_KEY);
  return token || null;
};

export function MediaImage({
  src,
  fallbackSrc,
  onError,
  ...props
}: MediaImageProps) {
  const resolvedSrc = resolveMediaUrl(src);
  const [displaySrc, setDisplaySrc] = React.useState(
    resolvedSrc || fallbackSrc,
  );
  const [blobSrc, setBlobSrc] = React.useState<string | null>(null);
  const triedAuthRef = React.useRef(false);
  const prevResolvedRef = React.useRef(resolvedSrc);

  React.useEffect(() => {
    // Only reset if the resolved source actually changed
    if (prevResolvedRef.current === resolvedSrc) return;
    prevResolvedRef.current = resolvedSrc;
    triedAuthRef.current = false;
    if (blobSrc) {
      URL.revokeObjectURL(blobSrc);
      setBlobSrc(null);
    }
    setDisplaySrc(resolvedSrc || fallbackSrc);
  }, [resolvedSrc, fallbackSrc, blobSrc]);

  React.useEffect(() => {
    if (!blobSrc) return;
    return () => {
      URL.revokeObjectURL(blobSrc);
    };
  }, [blobSrc]);

  const trustedOrigins = React.useMemo(() => {
    const origins = new Set<string>();
    const mediaOrigin = getOrigin(getMediaBaseUrl());
    if (mediaOrigin) origins.add(mediaOrigin);
    const apiBase = import.meta.env.VITE_API_URL;
    if (apiBase) {
      const apiOrigin = getOrigin(
        new URL(apiBase, window.location.origin).toString(),
      );
      if (apiOrigin) origins.add(apiOrigin);
    }
    return origins;
  }, []);

  const baseDomain =
    typeof window !== "undefined"
      ? getBaseDomain(window.location.hostname)
      : null;

  const tryAuthFetch = React.useCallback(async () => {
    if (!resolvedSrc) return false;
    if (isSkippableScheme(resolvedSrc)) return false;
    const resolvedOrigin = getOrigin(resolvedSrc);
    if (
      !resolvedOrigin ||
      !isOriginTrusted(resolvedOrigin, trustedOrigins, baseDomain)
    )
      return false;

    try {
      const token = getAuthToken();
      const response = await fetch(
        resolvedSrc,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      );
      if (!response.ok) return false;
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      setBlobSrc(objectUrl);
      setDisplaySrc(objectUrl);
      return true;
    } catch {
      return false;
    }
  }, [resolvedSrc, trustedOrigins, baseDomain]);

  return (
    <img
      {...props}
      src={displaySrc}
      onError={(event) => {
        if (!triedAuthRef.current) {
          triedAuthRef.current = true;
          setDisplaySrc(fallbackSrc);
          void tryAuthFetch();
          return;
        }
        setDisplaySrc(fallbackSrc);
        onError?.(event);
      }}
    />
  );
}
