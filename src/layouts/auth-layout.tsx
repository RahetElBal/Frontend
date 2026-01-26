import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-linear-to-br from-white via-accent-pink-50 to-accent-blue-50",
        "flex items-center justify-center p-4",
        className,
      )}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-left blob */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-accent-pink-200 rounded-full opacity-30 blur-3xl" />
        {/* Bottom-right blob */}
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent-blue-200 rounded-full opacity-30 blur-3xl" />
        {/* Center accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-accent-pink-100 rounded-full opacity-20 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">{children}</div>
    </div>
  );
}
