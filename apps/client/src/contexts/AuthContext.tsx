import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useMutation } from "@apollo/client/react";
import { LOGIN_MUTATION } from "../graphql/mutations";
import { setTokens, clearTokens, hasTokens } from "../utils/tokenStorage";

/**
 * User role enum matching backend
 */
export enum Role {
  EMPLOYEE = "EMPLOYEE",
  TECH_LEAD = "TECH_LEAD",
  ADMIN = "ADMIN",
}

/**
 * Profile information for authenticated user
 */
export interface Profile {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/**
 * Authentication context value interface
 */
interface AuthContextValue {
  isAuthenticated: boolean;
  profile: Profile | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

/**
 * Login mutation response shape
 */
interface LoginResponse {
  login: {
    accessToken: string;
    refreshToken: string;
    profile: Profile;
  };
}

/**
 * Login mutation variables shape
 */
interface LoginVariables {
  input: {
    email: string;
    password: string;
  };
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider component for managing authentication state
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [loginMutation, { loading }] = useMutation<
    LoginResponse,
    LoginVariables
  >(LOGIN_MUTATION);

  // Check for existing tokens on mount
  useEffect(() => {
    const checkAuth = () => {
      const hasAuth = hasTokens();
      setIsAuthenticated(hasAuth);
      // Note: We don't have profile info until next login
      // In production, you might want to fetch current user on mount
    };

    checkAuth();
  }, []);

  /**
   * Login user with email and password
   * Stores tokens and profile on success
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      setError(null);
      const result = await loginMutation({
        variables: {
          input: { email, password },
        },
      });

      if (result.data) {
        const {
          accessToken,
          refreshToken,
          profile: userProfile,
        } = result.data.login;

        // Store tokens in localStorage
        setTokens(accessToken, refreshToken);

        // Update authentication state
        setIsAuthenticated(true);
        setProfile(userProfile);
      }
    } catch (err: any) {
      // Extract error message from GraphQL error
      const errorMessage =
        err.graphQLErrors?.[0]?.message || "Login failed. Please try again.";
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * Logout user and clear authentication state
   */
  const logout = (): void => {
    clearTokens();
    setIsAuthenticated(false);
    setProfile(null);
    setError(null);
  };

  const value: AuthContextValue = {
    isAuthenticated,
    profile,
    login,
    logout,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access authentication context
 * @throws Error if used outside AuthProvider
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
