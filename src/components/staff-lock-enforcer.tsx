import { useEffect } from "react";
import { useAuthContext } from "@/contexts/AuthProvider";
import { useStaffLock } from "@/contexts/StaffLockProvider";
import { markStaffKicked } from "@/lib/staff-lock";

export function StaffLockEnforcer() {
  const { user, isAuthenticated, isLoading, logout } = useAuthContext();
  const { lockActive } = useStaffLock();

  useEffect(() => {
    if (isLoading || !lockActive) return;
    if (!isAuthenticated || !user) return;

    const isStaff = user.role === "user" && !user.isSuperadmin;
    if (!isStaff) return;

    markStaffKicked();
    logout();
  }, [isLoading, lockActive, isAuthenticated, user, logout]);

  return null;
}
