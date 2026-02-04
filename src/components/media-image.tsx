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

const isSameOrigin = (first: string, second: string) => {
  try {
    return new URL(first).origin === new URL(second).origin;
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

  React.useEffect(() => {
    triedAuthRef.current = false;
    setBlobSrc(null);
    setDisplaySrc(resolvedSrc || fallbackSrc);
  }, [resolvedSrc, fallbackSrc]);

  React.useEffect(() => {
    if (!blobSrc) return;
    return () => {
      URL.revokeObjectURL(blobSrc);
    };
  }, [blobSrc]);

  const tryAuthFetch = React.useCallback(async () => {
    if (!resolvedSrc) return false;
    if (isSkippableScheme(resolvedSrc)) return false;
    if (!isSameOrigin(resolvedSrc, getMediaBaseUrl())) return false;

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
  }, [resolvedSrc]);

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
