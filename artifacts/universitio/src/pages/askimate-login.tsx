import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import logoImg from "@assets/universitio logo.png";
import { Mail, Chrome, ArrowLeft } from "lucide-react";
import { useAskiMateAuth } from "@/contexts/AskiMateAuthContext";

export default function AskiMateLogin() {
  const [location, setLocation] = useLocation();
  const { login, googleLogin } = useAskiMateAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Read google_error from URL (set by backend when Google OAuth fails) and clear it
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleError = params.get("google_error");
    if (googleError) {
      setError(decodeURIComponent(googleError));
      params.delete("google_error");
      const newSearch = params.toString();
      window.history.replaceState({}, "", window.location.pathname + (newSearch ? `?${newSearch}` : ""));
    }
  }, []);

  const handleBack = () => {
    if (document.referrer && document.referrer.includes(location.split("/")[2])) {
      window.history.back();
    } else {
      setLocation("/askimate");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center px-4">
      <Helmet>
        <title>Log In — AskiMate AI</title>
        <meta name="description" content="Log in to your AskiMate account." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <img
            src={logoImg}
            alt="Universitio"
            className="h-10 w-auto object-contain mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-muted-foreground text-sm">
            Log in to your AskiMate account and continue your education mentoring journey
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-border/60 p-8 shadow-sm">
          {/* Social Auth */}
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => googleLogin()}
            >
              <Chrome className="w-5 h-5 mr-2" />
              Continue with Google
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => setLocation("/askimate-signup")}
            >
              <Mail className="w-5 h-5 mr-2" />
              Continue with Email
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/40"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {/* Email & Password Form */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setLoading(true);
              try {
                await login(email, password);
                
                // Migrate guest conversation if it exists
                const guestSessionId = localStorage.getItem("askimate_guest_session_id");
                const token = localStorage.getItem("askimate_token");
                if (guestSessionId && token) {
                  try {
                    await fetch(`${import.meta.env.BASE_URL}api/askimate/chat/migrate`, {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ guestSessionId }),
                    });
                  } catch (migrationError) {
                    console.error("Guest migration failed:", migrationError);
                  }
                }
                
                setLocation("/askimate-dashboard");
              } catch (err) {
                setError(err instanceof Error ? err.message : "Login failed");
              } finally {
                setLoading(false);
              }
            }}
            className="space-y-4"
          >
            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => {}}
                className="text-sm text-primary hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-white"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>
        </div>

        {/* Signup Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <button
            onClick={() => setLocation("/askimate-signup")}
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
