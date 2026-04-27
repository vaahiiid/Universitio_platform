import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Menu, X, ChevronDown, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImg from "@assets/universitio logo.png";
import askiMateLogoImg from "@assets/Mate_1777308270097.png";
import { useAskiMateAuth } from "@/contexts/AskiMateAuthContext";

export function AskiMateNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAskiMateAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setLocation("/askimate");
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const scrollToPackages = () => {
    const el = document.getElementById("packages");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border/50"
          : "bg-white/90 backdrop-blur-sm border-b border-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center gap-3">
            {/* AskiMate logo — main brand */}
            <img
              src={askiMateLogoImg}
              alt="AskiMate"
              className="h-9 w-auto object-contain"
              style={{ mixBlendMode: "multiply" }}
            />
            {/* Divider */}
            <div className="hidden sm:block h-5 w-px bg-border/60" />
            {/* Powered by Universitio */}
            <div
              className="hidden sm:flex items-center gap-1.5 cursor-pointer"
              onClick={() => setLocation("/")}
              title="Go to Universitio"
            >
              <span className="text-xs text-muted-foreground font-normal leading-none">
                Powered by
              </span>
              <img
                src={logoImg}
                alt="Universitio"
                className="h-5 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={scrollToPackages}
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors"
            >
              Packages
            </button>

            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors bg-muted/50 hover:bg-muted rounded-full pl-2 pr-3 py-1.5"
                >
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-white">
                    {user.firstName?.[0]?.toUpperCase()}
                  </div>
                  <span>{user.firstName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-border/50 overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-border/30 bg-muted/20">
                      <p className="text-xs text-muted-foreground mb-0.5">Signed in as</p>
                      <p className="text-sm font-semibold text-foreground">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => { setLocation("/askimate-dashboard"); setIsUserMenuOpen(false); }}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-primary" />
                        My Dashboard
                      </button>
                      <div className="border-t border-border/30 mt-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/askimate-login")}
                  className="font-medium text-foreground/70 hover:text-primary"
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => setLocation("/askimate-signup")}
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-5 shadow-sm"
                >
                  Sign Up Free
                </Button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-foreground p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b shadow-lg">
          <div className="px-4 pt-2 pb-5 space-y-1">
            <button
              onClick={scrollToPackages}
              className="block w-full text-left px-3 py-3 text-base font-medium text-foreground hover:bg-muted rounded-md"
            >
              Packages
            </button>

            {isAuthenticated && user ? (
              <>
                <div className="mx-3 py-2.5 px-3 bg-muted/40 rounded-lg my-2">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="text-sm font-semibold text-foreground">{user.firstName} {user.lastName}</p>
                </div>
                <button
                  onClick={() => { setLocation("/askimate-dashboard"); setIsMobileMenuOpen(false); }}
                  className="block w-full text-left px-3 py-3 text-base font-medium text-foreground hover:bg-muted rounded-md"
                >
                  My Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-3 space-y-2">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6"
                  onClick={() => { setLocation("/askimate-signup"); setIsMobileMenuOpen(false); }}
                >
                  Sign Up Free
                </Button>
                <Button
                  variant="outline"
                  className="w-full rounded-xl py-6 border-primary/30 text-primary"
                  onClick={() => { setLocation("/askimate-login"); setIsMobileMenuOpen(false); }}
                >
                  Log In
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
