import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AskiMateUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  dateOfBirth?: string;
  marketingConsent: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  plan: "free" | "premium";
  trialEndsAt?: string;
  createdAt?: string;
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
  refreshUser: () => Promise<void>;
}

const AskiMateAuthContext = createContext<AskiMateAuthContextType | undefined>(undefined);

const API_BASE = `${import.meta.env.BASE_URL}api`;

export function AskiMateAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AskiMateUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount — also handles Google OAuth callback token
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // ── Google OAuth callback: pick up token from URL ──────────────────────
        const urlParams = new URLSearchParams(window.location.search);
        const googleToken = urlParams.get("google_token");

        if (googleToken) {
          // Store the JWT from the OAuth redirect and clean up the URL
          localStorage.setItem("askimate_token", googleToken);
          urlParams.delete("google_token");
          const newSearch = urlParams.toString();
          const newUrl = window.location.pathname + (newSearch ? `?${newSearch}` : "");
          window.history.replaceState({}, "", newUrl);
        }

        // ── Standard token restore ─────────────────────────────────────────────
        const token = localStorage.getItem("askimate_token");
        if (token) {
          const response = await fetch(`${API_BASE}/askimate/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // Token is invalid, clear it
            localStorage.removeItem("askimate_token");
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const signup = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const response = await fetch(`${API_BASE}/askimate/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Signup failed");
      }

      const data = await response.json();
      localStorage.setItem("askimate_token", data.token);
      setUser(data.user);
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE}/askimate/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("askimate_token", data.token);
      setUser(data.user);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem("askimate_token");
      if (token) {
        await fetch(`${API_BASE}/askimate/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      // Clear ALL user-specific state
      localStorage.removeItem("askimate_token");
      localStorage.removeItem("askimate_guest_session_id"); // Critical: prevent leakage to next user
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<AskiMateUser>) => {
    try {
      const token = localStorage.getItem("askimate_token");
      if (!token) {
        throw new Error("Not authenticated");
      }

      const response = await fetch(`${API_BASE}/askimate/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Profile update failed");
      }

      const updatedUser = await response.json();
      setUser((prev) => (prev ? { ...prev, ...updatedUser } : null));
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    }
  };

  const googleLogin = async () => {
    // Redirect the browser to the backend Google OAuth initiation route.
    // The backend will redirect to Google, then back to /api/askimate/auth/google/callback,
    // which finally redirects here with ?google_token= handled in the useEffect above.
    window.location.href = "/api/askimate/auth/google";
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem("askimate_token");
      if (!token) return;
      const response = await fetch(`${API_BASE}/askimate/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error("refreshUser failed:", error);
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
        refreshUser,
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
