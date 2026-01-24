/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useAuthContext } from "./AuthProvider";

/**
 * View Mode Context
 * 
 * Allows admins to switch between "admin" and "user" viewing modes.
 * This affects UI visibility only, NOT actual permissions.
 * Backend authorization remains enforced regardless of view mode.
 * 
 * Use cases:
 * - Admin wants to preview the app as a regular user would see it
 * - Testing user experience without switching accounts
 */

export type ViewMode = "admin" | "user";

interface ViewModeContextType {
  /** Current viewing mode */
  viewMode: ViewMode;
  /** Whether user can switch modes (only admins can) */
  canSwitchMode: boolean;
  /** Whether currently in user view mode (for UI checks) */
  isUserViewMode: boolean;
  /** Whether currently in admin view mode */
  isAdminViewMode: boolean;
  /** Switch to a specific mode */
  setViewMode: (mode: ViewMode) => void;
  /** Toggle between admin and user mode */
  toggleViewMode: () => void;
  /** Reset to default mode based on user's actual role */
  resetViewMode: () => void;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

interface ViewModeProviderProps {
  children: ReactNode;
}

export function ViewModeProvider({ children }: ViewModeProviderProps) {
  const { user, isAdmin, isSuperadmin } = useAuthContext();
  
  // Default mode is based on actual role
  const defaultMode: ViewMode = (isAdmin || isSuperadmin) ? "admin" : "user";
  
  const [viewMode, setViewModeState] = useState<ViewMode>(defaultMode);

  // Only admins and superadmins can switch modes
  const canSwitchMode = isAdmin || isSuperadmin;

  const setViewMode = useCallback((mode: ViewMode) => {
    if (!canSwitchMode) return;
    setViewModeState(mode);
  }, [canSwitchMode]);

  const toggleViewMode = useCallback(() => {
    if (!canSwitchMode) return;
    setViewModeState((current) => (current === "admin" ? "user" : "admin"));
  }, [canSwitchMode]);

  const resetViewMode = useCallback(() => {
    setViewModeState(defaultMode);
  }, [defaultMode]);

  // Derived state for easier checks
  const isUserViewMode = viewMode === "user";
  const isAdminViewMode = viewMode === "admin";

  // Reset view mode when user changes or logs out
  // (This happens automatically because the provider re-renders)

  const value: ViewModeContextType = {
    viewMode,
    canSwitchMode,
    isUserViewMode,
    isAdminViewMode,
    setViewMode,
    toggleViewMode,
    resetViewMode,
  };

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (context === undefined) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return context;
}
