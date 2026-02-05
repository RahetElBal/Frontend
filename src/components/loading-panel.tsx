import { Spinner } from "@/components/spinner";
import { cn } from "@/lib/utils";

interface LoadingPanelProps {
  label?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function LoadingPanel({
  label,
  className,
  size = "md",
}: LoadingPanelProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-8 text-muted-foreground",
        className,
      )}
    >
      <Spinner size={size} />
      {label && <p className="text-sm">{label}</p>}
    </div>
  );
}
