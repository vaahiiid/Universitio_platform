import { useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import logoImg from "@assets/universitio logo.png";
import { Mail, Chrome, ArrowLeft } from "lucide-react";
import { useAskiMateAuth } from "@/contexts/AskiMateAuthContext";

export default function AskiMateSignup() {
  const [location, setLocation] = useLocation();
  const { signup, googleLogin } = useAskiMateAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        <title>Sign Up — AskiMate AI</title>
        <meta name="description" content="Create your AskiMate account to get started with mentoring." />
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
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Your Account</h1>
          <p className="text-muted-foreground text-sm mb-4">
            Join AskiMate AI to get expert guidance on your education journey
          </p>
          <p className="text-xs text-muted-foreground">
            Get your first 3 days free on Premium Mentoring. No credit card required.
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
              onClick={() => {}}
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
                await signup(email, password, firstName, lastName);
                setLocation("/askimate-dashboard");
              } catch (err) {
                setError(err instanceof Error ? err.message : "Signup failed");
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  First name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Last name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                />
              </div>
            </div>

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
                placeholder="At least 8 characters"
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
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          {/* Terms */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            By signing up, you agree to our{" "}
            <button onClick={() => setLocation("/terms-and-conditions")} className="text-primary hover:underline">
              Terms & Conditions
            </button>{" "}
            and{" "}
            <button onClick={() => setLocation("/privacy-policy")} className="text-primary hover:underline">
              Privacy Policy
            </button>
          </p>
        </div>

        {/* Login Link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <button
            onClick={() => setLocation("/askimate-login")}
            className="text-primary hover:underline font-medium"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}
