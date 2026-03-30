import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AskiMateUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  dateOfBirth?: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  marketingConsent: boolean;
  plan: "free" | "premium";
  trialEndsAt?: string;
  createdAt: string;
}

interface AskiMateAuthContextType {
  user: AskiMateUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<AskiMateUser>) => Promise<void>;
  googleLogin: () => Promise<void>;
}

const AskiMateAuthContext = createContext<AskiMateAuthContextType | undefined>(undefined);

export function AskiMateAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AskiMateUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("askimate_token");
        if (token) {
          // Verify token is still valid and get user data
          // This is a placeholder for future implementation
          setLoading(false);
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      // Placeholder for real signup implementation
      // This will call backend endpoint when implemented
      console.log("Signup:", { email, firstName, lastName });
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Placeholder for real login implementation
      // This will call backend endpoint when implemented
      console.log("Login:", { email });
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("askimate_token");
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<AskiMateUser>) => {
    try {
      // Placeholder for real profile update
      if (user) {
        setUser({ ...user, ...updates });
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  };

  const googleLogin = async () => {
    try {
      // Placeholder for Google OAuth implementation
      console.log("Google login triggered");
    } catch (error) {
      console.error("Google login failed:", error);
      throw error;
    }
  };

  return (
    <AskiMateAuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        signup,
        login,
        logout,
        updateProfile,
        googleLogin,
      }}
    >
      {children}
    </AskiMateAuthContext.Provider>
  );
}

export function useAskiMateAuth() {
  const context = useContext(AskiMateAuthContext);
  if (!context) {
    throw new Error("useAskiMateAuth must be used within AskiMateAuthProvider");
  }
  return context;
}
