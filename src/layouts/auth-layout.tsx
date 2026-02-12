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
        "min-h-screen w-full bg-linear-to-br from-accent-pink-50 to-accent-blue-50",
        "flex items-center justify-center p-4 relative overflow-hidden",
        className,
      )}
    >
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top-left blob */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-linear-to-br from-accent-pink/20 to-accent-pink/5 rounded-full blur-3xl animate-pulse" />

        {/* Bottom-right blob */}
        <div className="absolute -bottom-40 -right-40 w-lg h-128 bg-linear-to-tl from-accent-blue/20 to-accent-blue/5 rounded-full blur-3xl animate-pulse delay-1000" />

        {/* Center accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-160 h-160 bg-linear-to-br from-accent-pink/10 via-transparent to-accent-blue/10 rounded-full blur-3xl" />

        {/* Brand cover watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <img
            src="/branding/beautiq-cover.svg"
            alt=""
            className="w-[70rem] max-w-[92vw] select-none"
            aria-hidden="true"
          />
        </div>

        {/* Decorative grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      {/* Content Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          {children}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 z-10 text-center">
        <p className="text-sm text-muted-foreground">
          © 2026 Beautiq. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
