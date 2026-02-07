export type StaffLockReason = "offline" | "manual" | "remote";

export interface StaffLockState {
  active: boolean;
  activatedAt?: string;
  clearedAt?: string;
  reason?: StaffLockReason;
}

export const STAFF_LOCK_KEY = "staff_lockdown";
export const STAFF_LOCK_KICK_KEY = "staff_lock_kicked_at";

const DEFAULT_STATE: StaffLockState = { active: false };

const isBrowser = () => typeof window !== "undefined";

export const readStaffLock = (): StaffLockState => {
  if (!isBrowser()) return { ...DEFAULT_STATE };
  const raw = localStorage.getItem(STAFF_LOCK_KEY);
  if (!raw) return { ...DEFAULT_STATE };

  try {
    const parsed = JSON.parse(raw) as StaffLockState;
    if (typeof parsed?.active === "boolean") {
      return {
        active: parsed.active,
        activatedAt: parsed.activatedAt,
        clearedAt: parsed.clearedAt,
        reason: parsed.reason,
      };
    }
  } catch {
    // Ignore parse errors and fall back to default
  }

  return { ...DEFAULT_STATE };
};

export const writeStaffLock = (state: StaffLockState) => {
  if (!isBrowser()) return;
  localStorage.setItem(STAFF_LOCK_KEY, JSON.stringify(state));
};

export const activateStaffLock = (
  reason: StaffLockReason = "offline",
): StaffLockState => {
  const current = readStaffLock();
  if (current.active) return current;

  const next: StaffLockState = {
    active: true,
    activatedAt: new Date().toISOString(),
    reason,
  };

  writeStaffLock(next);
  return next;
};

export const clearStaffLock = (): StaffLockState => {
  const next: StaffLockState = {
    active: false,
    clearedAt: new Date().toISOString(),
  };

  writeStaffLock(next);
  return next;
};

export const markStaffKicked = () => {
  if (!isBrowser()) return;
  localStorage.setItem(STAFF_LOCK_KICK_KEY, new Date().toISOString());
};

export const readStaffKickedAt = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(STAFF_LOCK_KICK_KEY);
};

export const clearStaffKickedAt = () => {
  if (!isBrowser()) return;
  localStorage.removeItem(STAFF_LOCK_KICK_KEY);
};
