import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen w-full bg-linear-to-br from-pink-50 to-blue-50",
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

        {/* Decorative grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      </div>

      {/* Logo/Branding */}
      <div className="absolute top-8 left-8 z-10">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-linear-to-br from-accent-pink to-accent-blue flex items-center justify-center shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-linear-to-r from-accent-pink to-accent-blue bg-clip-text text-transparent">
            SalonFlow
          </span>
        </div>
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
          © 2025 SalonFlow. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
