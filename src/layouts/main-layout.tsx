import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * Main layout wrapper for authenticated pages
 * Provides the outer container for sidebar + content
 */
export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-screen bg-background',
        className
      )}
    >
      {children}
    </div>
  );
}
