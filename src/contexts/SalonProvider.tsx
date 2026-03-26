/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { AppRole } from "@/constants/enum";
import type { Salon } from "@/pages/admin/salon/types";
import { get } from "@/lib/http";
import { AUTH_STORAGE_KEY } from "@/constants/auth";
import type { AuthUser } from "@/types/user";

const SALON_STORAGE_KEY = "selected_salon_id";

interface SalonContextType {
  currentSalon: Salon | null;
  salons: Salon[];
  isLoading: boolean;
  hasError: boolean;
  selectSalon: (salon: Salon) => void;
  clearSalon: () => void;
  refreshSalons: () => Promise<void>;
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

interface SalonProviderProps {
  children: ReactNode;
}

const MAX_RETRIES = 2;

// Helper to check if user is superadmin from stored user data
function getStoredUserRole(): { isSuperadmin: boolean; isAdmin: boolean; hasUser: boolean } {
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser) as AuthUser;
      return {
        isSuperadmin:
          user.isSuperadmin === true || user.role === AppRole.SUPER_ADMIN,
        isAdmin: user.role === AppRole.ADMIN,
        hasUser: true,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return { isSuperadmin: false, isAdmin: false, hasUser: false };
}

export function SalonProvider({ children }: SalonProviderProps) {
  const [currentSalon, setCurrentSalon] = useState<Salon | null>(null);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const retryCountRef = useRef(0);

  // Fetch user's salons
  const refreshSalons = useCallback(async () => {
    const token = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!token) {
      setIsLoading(false);
      setSalons([]);
      return;
    }

    const { isSuperadmin, hasUser } = getStoredUserRole();

    // If no user data yet, don't fetch (wait for auth to complete)
    if (!hasUser) {
      setIsLoading(false);
      return;
    }

    // Superadmin doesn't need to fetch salons for basic access
    // They access admin panel which manages all salons
    if (isSuperadmin) {
      setIsLoading(false);
      setSalons([]);
      setHasError(false);
      return;
    }

    try {
      setIsLoading(true);
      setHasError(false);
      const data = await get<Salon[]>("salons/my-salons");
      setSalons(data);
      retryCountRef.current = 0; // Reset retry count on success

      // Try to restore previously selected salon
      const storedSalonId = localStorage.getItem(SALON_STORAGE_KEY);
      if (storedSalonId) {
        const storedSalon = data.find((s) => s.id === storedSalonId);
        if (storedSalon) {
          setCurrentSalon(storedSalon);
        } else if (data.length === 1) {
          // If only one salon, auto-select it
          setCurrentSalon(data[0]);
          localStorage.setItem(SALON_STORAGE_KEY, data[0].id);
        }
      } else if (data.length === 1) {
        // If only one salon and no stored preference, auto-select
        setCurrentSalon(data[0]);
        localStorage.setItem(SALON_STORAGE_KEY, data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch salons:", error);
      setSalons([]);
      setHasError(true);
      // Track retries without triggering re-renders
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current += 1;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize on mount and when auth changes
  useEffect(() => {
    refreshSalons();
    
    // Listen for storage changes (for when auth completes)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user" || e.key === AUTH_STORAGE_KEY) {
        refreshSalons();
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refreshSalons]);

  const selectSalon = useCallback((salon: Salon) => {
    setCurrentSalon(salon);
    localStorage.setItem(SALON_STORAGE_KEY, salon.id);
  }, []);

  const clearSalon = useCallback(() => {
    setCurrentSalon(null);
    localStorage.removeItem(SALON_STORAGE_KEY);
  }, []);

  return (
    <SalonContext.Provider
      value={{
        currentSalon,
        salons,
        isLoading,
        hasError,
        selectSalon,
        clearSalon,
        refreshSalons,
      }}
    >
      {children}
    </SalonContext.Provider>
  );
}

export function useSalon() {
  const context = useContext(SalonContext);
  if (context === undefined) {
    throw new Error("useSalon must be used within a SalonProvider");
  }
  return context;
}
