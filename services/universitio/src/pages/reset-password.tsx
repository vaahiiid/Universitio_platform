import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import logoImg from "@assets/universitio logo.png";

type State = "form" | "success" | "invalid" | "expired";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<State>("form");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token") ?? "";
    if (!t) {
      setState("invalid");
    } else {
      setToken(t);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/askimate/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json() as { message?: string; error?: string };

      if (!res.ok) {
        const msg = data.error ?? "Something went wrong.";
        if (msg.toLowerCase().includes("expired")) {
          setState("expired");
        } else if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("already been used")) {
          setState("invalid");
        } else {
          setError(msg);
        }
        return;
      }

      setState("success");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center px-4">
      <Helmet>
        <title>Reset Password — Universitio</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logoImg} alt="Universitio" className="h-10 w-auto object-contain mx-auto mb-6" />
        </div>

        <div className="bg-white rounded-xl border border-border/60 p-8 shadow-sm">

          {/* ── FORM STATE ─────────────────────────────────────────────── */}
          {state === "form" && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-1">Set a new password</h1>
                <p className="text-muted-foreground text-sm">
                  Choose a strong password for your Universitio account.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">New password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    required
                    autoFocus
                    minLength={8}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Confirm new password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat your new password"
                    className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Set New Password"}
                </Button>
              </form>
            </>
          )}

          {/* ── SUCCESS STATE ──────────────────────────────────────────── */}
          {state === "success" && (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-foreground">Password reset successfully</h2>
              <p className="text-sm text-muted-foreground">
                Your password has been reset. You can now log in with your new password.
              </p>
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white"
                onClick={() => setLocation("/askimate-login")}
              >
                Go to Login
              </Button>
            </div>
          )}

          {/* ── INVALID TOKEN STATE ────────────────────────────────────── */}
          {state === "invalid" && (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-foreground">Invalid reset link</h2>
              <p className="text-sm text-muted-foreground">
                This password reset link is invalid or has already been used. Please request a new one.
              </p>
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white"
                onClick={() => setLocation("/askimate-login")}
              >
                Request a New Link
              </Button>
            </div>
          )}

          {/* ── EXPIRED TOKEN STATE ────────────────────────────────────── */}
          {state === "expired" && (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-foreground">Reset link expired</h2>
              <p className="text-sm text-muted-foreground">
                This reset link has expired. Password reset links are valid for 60 minutes. Please request a new one.
              </p>
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-white"
                onClick={() => setLocation("/askimate-login")}
              >
                Request a New Link
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
