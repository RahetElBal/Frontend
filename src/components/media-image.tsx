import * as React from "react";
import { resolveMediaUrl } from "@/lib/media";

type MediaImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src"
> & {
  src?: string | null;
  fallbackSrc: string;
};

export function MediaImage({
  src,
  fallbackSrc,
  onError,
  ...props
}: MediaImageProps) {
  const resolvedSrc = resolveMediaUrl(src) || fallbackSrc;
  const fallbackAppliedRef = React.useRef(false);

  React.useEffect(() => {
    fallbackAppliedRef.current = false;
  }, [resolvedSrc, fallbackSrc]);

  return (
    <img
      {...props}
      src={resolvedSrc}
      onError={(event) => {
        if (!fallbackAppliedRef.current) {
          fallbackAppliedRef.current = true;
          event.currentTarget.src = fallbackSrc;
        }
        onError?.(event);
      }}
    />
  );
}
