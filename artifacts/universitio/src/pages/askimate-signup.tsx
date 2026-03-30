import { useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import logoImg from "@assets/universitio logo.png";
import { Mail, Chrome } from "lucide-react";

export default function AskiMateSignup() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-background flex items-center justify-center px-4">
      <Helmet>
        <title>Sign Up — AskiMate AI</title>
        <meta name="description" content="Create your AskiMate account to get started with mentoring." />
      </Helmet>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src={logoImg}
            alt="Universitio"
            className="h-10 w-auto object-contain mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Your Account</h1>
          <p className="text-muted-foreground">Join AskiMate and get started with mentoring</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-border/60 p-8 shadow-sm">
          {/* Social Auth */}
          <div className="space-y-3 mb-6">
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              onClick={() => {}}
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
            onSubmit={(e) => {
              e.preventDefault();
              // UI only - no backend yet
            }}
            className="space-y-4"
          >
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
            >
              Create Account
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
