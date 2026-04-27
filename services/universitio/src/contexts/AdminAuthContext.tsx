import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";

interface AdminAuth {
  isAuthenticated: boolean;
  email: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuth | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(() => localStorage.getItem("admin_email"));
  const [loading, setLoading] = useState(() => !!localStorage.getItem("admin_token"));

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) { setLoading(false); return; }
    apiFetch<{ email: string }>("/admin/auth/me")
      .then((res) => {
        setEmail(res.email);
        localStorage.setItem("admin_email", res.email);
      })
      .catch(() => {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_email");
        setEmail(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (em: string, pw: string) => {
    const res = await apiFetch<{ token: string; email: string }>("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: em, password: pw }),
    });
    localStorage.setItem("admin_token", res.token);
    localStorage.setItem("admin_email", res.email);
    setEmail(res.email);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_email");
    setEmail(null);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated: !!email && !loading, email, loading, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}
