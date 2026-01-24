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

const SALON_STORAGE_KEY = "selected_salon_id";

interface SalonContextType {
  currentSalon: Salon | null;
  salons: Salon[];
  isLoading: boolean;
  selectSalon: (salon: Salon) => void;
  clearSalon: () => void;
  refreshSalons: () => Promise<void>;
}

const SalonContext = createContext<SalonContextType | undefined>(undefined);

interface SalonProviderProps {
  children: ReactNode;
}

export function SalonProvider({ children }: SalonProviderProps) {
  const [currentSalon, setCurrentSalon] = useState<Salon | null>(null);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's salons
  const refreshSalons = useCallback(async () => {
    console.log("🔍 refreshSalons called");
    try {
      setIsLoading(true);
      console.log("🌐 Calling /salons/my-salons...");
      const data = await get<Salon[]>("salons/my-salons");
      console.log("✅ Salons received:", data);
      setSalons(data);
      // ... rest of the code
    } catch (error) {
      console.error("❌ Failed to fetch salons:", error);
      setSalons([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(
      "🔑 Token check in SalonProvider:",
      token ? "EXISTS" : "MISSING",
    );
    if (token) {
      console.log("✅ Token found, calling refreshSalons");
      refreshSalons();
    } else {
      console.log("❌ No token, skipping refreshSalons");
      setIsLoading(false);
    }
  }, [refreshSalons]);
  // Initialize on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
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
