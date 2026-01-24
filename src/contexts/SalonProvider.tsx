/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Salon } from "@/types/entities";
import { get } from "@/lib/http";
import { AUTH_STORAGE_KEY } from "@/constants/auth";

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

export function SalonProvider({ children }: SalonProviderProps) {
  const [currentSalon, setCurrentSalon] = useState<Salon | null>(null);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch user's salons
  const refreshSalons = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const data = await get<Salon[]>("salons/my-salons");
      setSalons(data);
      setRetryCount(0); // Reset retry count on success

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
      // Don't retry infinitely
      if (retryCount < MAX_RETRIES) {
        setRetryCount((prev) => prev + 1);
      }
    } finally {
      setIsLoading(false);
    }
  }, [retryCount]);

  // Initialize on mount
  useEffect(() => {
    const token = localStorage.getItem(AUTH_STORAGE_KEY);
    if (token) {
      refreshSalons();
    } else {
      setIsLoading(false);
    }
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
