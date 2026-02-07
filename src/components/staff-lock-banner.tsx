import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/contexts/AuthProvider";
import { useStaffLock } from "@/contexts/StaffLockProvider";
import { cn } from "@/lib/utils";

interface StaffLockBannerProps {
  className?: string;
}

export function StaffLockBanner({ className }: StaffLockBannerProps) {
  const { user, isAdmin, isSuperadmin } = useAuthContext();
  const { lock, lockActive, isOnline, clearLock } = useStaffLock();

  const canManage = isAdmin || isSuperadmin;

  const lockedAtLabel = useMemo(() => {
    if (!lock.activatedAt) return null;
    const date = new Date(lock.activatedAt);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString();
  }, [lock.activatedAt]);

  if (!user || !canManage || !lockActive) return null;

  return (
    <div
      className={cn(
        "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex flex-col gap-3 md:flex-row md:items-center md:justify-between",
        className,
      )}
    >
      <div className="space-y-1">
        <p className="font-semibold">Staff access is temporarily paused.</p>
        <p className="text-amber-800">
          {isOnline
            ? "Connection is back. Reactivate staff when you are ready."
            : "We detected an offline session. Staff access will stay paused until you reactivate it."}
        </p>
        {lockedAtLabel && (
          <p className="text-xs text-amber-700">Paused at {lockedAtLabel}</p>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="self-start md:self-auto"
        onClick={clearLock}
        disabled={!isOnline}
      >
        Reactivate staff
      </Button>
    </div>
  );
}
