/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { AuthUser, AuthState, AppRole } from '@/types/user';
import { AUTH_STORAGE_KEY } from '@/constants/auth';

interface AuthContextValue extends AuthState {
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
  isSuperadmin: boolean;
  isAdmin: boolean;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Role hierarchy for access checks
const ROLE_HIERARCHY: Record<AppRole, number> = {
  superadmin: 3,
  admin: 2,
  user: 1,
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem(AUTH_STORAGE_KEY);
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          const user = JSON.parse(storedUser) as AuthUser;
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch {
        // Clear corrupted data
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem('user');
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback((user: AuthUser, token: string) => {
    localStorage.setItem(AUTH_STORAGE_KEY, token);
    localStorage.setItem('user', JSON.stringify(user));
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('user');
    localStorage.removeItem('selected_salon'); // Also clear selected salon
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const updateUser = useCallback((user: AuthUser) => {
    localStorage.setItem('user', JSON.stringify(user));
    setState((prev) => ({
      ...prev,
      user,
    }));
  }, []);

  // Check if user is superadmin
  const isSuperadmin = state.user?.isSuperadmin === true || state.user?.role === 'superadmin';

  // Check if user is admin (or superadmin)
  const isAdmin = isSuperadmin || state.user?.role === 'admin';

  // Check if user has at least the specified role level
  const hasRole = useCallback((requiredRole: AppRole): boolean => {
    if (!state.user) return false;
    
    const userRole = state.user.role as AppRole;
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
    
    return userLevel >= requiredLevel;
  }, [state.user]);

  const value: AuthContextValue = {
    ...state,
    login,
    logout,
    updateUser,
    isSuperadmin,
    isAdmin,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
