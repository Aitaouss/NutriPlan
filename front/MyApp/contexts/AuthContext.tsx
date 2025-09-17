import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  getStoredToken,
  getStoredUserData,
  clearStoredData,
  storeToken,
  storeUserData,
} from "../services/api";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  logout: () => Promise<void>;
  setUser: (user: User) => Promise<void>;
  setToken: (token: string) => Promise<void>;
  refreshAuthState: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);
  const checkAuthState = async () => {
    try {
      setLoading(true);
      const storedToken = await getStoredToken();
      const storedUser = await getStoredUserData();

      console.log("AuthProvider - Checking stored auth state");
      console.log("Stored Token:", storedToken ? "Found" : "Not found");
      console.log("Stored User:", storedUser ? storedUser : "Not found");

      if (storedToken && storedUser) {
        setTokenState(storedToken);
        setUserState(storedUser);
        setIsAuthenticated(true);
        console.log("AuthProvider - User authenticated:", storedUser.email);
      } else {
        console.log("AuthProvider - No valid auth data found");
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Error checking auth state:", error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };
  const setUser = async (newUser: User) => {
    try {
      setUserState(newUser);
      setIsAuthenticated(true);
      await storeUserData(newUser);
      console.log("AuthProvider - User data stored:", newUser.email);
    } catch (error) {
      console.error("Error storing user data:", error);
    }
  };

  const setToken = async (newToken: string) => {
    try {
      setTokenState(newToken);
      await storeToken(newToken);
      console.log("AuthProvider - Token stored successfully");
    } catch (error) {
      console.error("Error storing token:", error);
    }
  };
  const logout = async () => {
    try {
      await clearStoredData();
      setUserState(null);
      setTokenState(null);
      setIsAuthenticated(false);
      console.log("AuthProvider - User logged out successfully");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };
  const refreshAuthState = async () => {
    console.log("AuthProvider - Refreshing auth state...");
    await checkAuthState();
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    token,
    loading,
    logout,
    setUser,
    setToken,
    refreshAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
