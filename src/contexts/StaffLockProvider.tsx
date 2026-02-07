import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useAuthContext } from "@/contexts/AuthProvider";
import {
  STAFF_LOCK_KEY,
  activateStaffLock,
  clearStaffLock as clearStaffLockState,
  readStaffLock,
  type StaffLockState,
} from "@/lib/staff-lock";
import { get, patch } from "@/lib/http";
import { toast } from "@/lib/toast";
import type { Salon } from "@/types/entities";

interface StaffLockContextValue {
  lock: StaffLockState;
  lockActive: boolean;
  isOnline: boolean;
  activateLock: () => void;
  clearLock: () => void;
}

const StaffLockContext = createContext<StaffLockContextValue | undefined>(
  undefined,
);

interface StaffLockProviderProps {
  children: ReactNode;
}

export function StaffLockProvider({ children }: StaffLockProviderProps) {
  const { user, isAuthenticated, isAdmin, isSuperadmin } = useAuthContext();
  const [lock, setLock] = useState<StaffLockState>(() => readStaffLock());
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const salonId = user?.salon?.id;

  const syncRemoteLock = useCallback(async () => {
    if (!salonId || !(isAdmin || isSuperadmin)) return;
    try {
      const salon = await get<Salon>(`salons/${salonId}`);
      if (salon.staffLockActive) {
        const next = activateStaffLock("remote");
        setLock(next);
      } else if (lock.active && lock.reason === "remote") {
        const next = clearStaffLockState();
        setLock(next);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("[StaffLock] Failed to sync remote state", error);
      }
    }
  }, [salonId, isAdmin, isSuperadmin, lock.active, lock.reason]);

  const activateRemoteLock = useCallback(
    async (reason: string = "offline") => {
      if (!salonId) return;
      try {
        await patch<Salon, { active: boolean; reason?: string }>(
          `salons/${salonId}/staff-lock`,
          { active: true, reason },
        );
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn("[StaffLock] Failed to activate remote lock", error);
        }
      }
    },
    [salonId],
  );

  const activateLock = useCallback(() => {
    const next = activateStaffLock("offline");
    setLock(next);
    if (isOnline) {
      void activateRemoteLock("offline");
    }
  }, [activateRemoteLock, isOnline]);

  const clearLock = useCallback(async () => {
    if (salonId) {
      try {
        await patch<Salon, { active: boolean }>(
          `salons/${salonId}/staff-lock`,
          { active: false },
        );
      } catch (error) {
        toast.error("Unable to reactivate staff. Please try again.");
        return;
      }
    }

    const next = clearStaffLockState();
    setLock(next);
  }, [salonId]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STAFF_LOCK_KEY) {
        setLock(readStaffLock());
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOnline) {
      const current = readStaffLock();
      if (!current.active) {
        activateLock();
      }
    }
  }, [isOnline, activateLock]);

  useEffect(() => {
    if (!isAuthenticated || !salonId) return;
    if (user?.salon?.staffLockActive) {
      const next = activateStaffLock("remote");
      setLock(next);
    } else if (lock.active && lock.reason === "remote") {
      const next = clearStaffLockState();
      setLock(next);
    }
  }, [
    isAuthenticated,
    salonId,
    user?.salon?.staffLockActive,
    lock.active,
    lock.reason,
  ]);

  useEffect(() => {
    if (isOnline && lock.active && lock.reason === "offline") {
      void activateRemoteLock("offline");
    }
  }, [isOnline, lock.active, lock.reason, activateRemoteLock]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void syncRemoteLock();
  }, [isAuthenticated, syncRemoteLock]);

  const value = useMemo(
    () => ({
      lock,
      lockActive: lock.active,
      isOnline,
      activateLock,
      clearLock,
    }),
    [lock, isOnline, activateLock, clearLock],
  );

  return (
    <StaffLockContext.Provider value={value}>
      {children}
    </StaffLockContext.Provider>
  );
}

export function useStaffLock() {
  const context = useContext(StaffLockContext);
  if (!context) {
    throw new Error("useStaffLock must be used within a StaffLockProvider");
  }
  return context;
}
