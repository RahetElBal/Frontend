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
        "min-h-screen w-full bg-background",
        "flex items-center justify-center p-4 relative overflow-hidden",
        className,
      )}
    >
      {/* Logo/Branding */}
      <div className="absolute top-8 left-8 z-10">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-lg bg-linear-to-br from-accent-pink to-accent-blue flex items-center justify-center shadow-lg">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-display font-bold bg-linear-to-r from-accent-pink to-accent-blue bg-clip-text text-transparent">
            SalonFlow
          </span>
        </div>
      </div>

      {/* Content Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-card/80 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/10 border border-border/60 p-8">
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


