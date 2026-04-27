import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Menu, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImg from "@assets/universitio logo.png";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith("/#")) {
      const targetId = href.replace("/#", "");
      if (location === "/") {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        const base = import.meta.env.BASE_URL.replace(/\/$/, "");
        window.location.href = `${base}${href}`;
      }
    } else {
      setLocation(href);
    }
  };

  const navLinks = [
    { name: "About Us", href: "/about" },
    { name: "AskiMate AI", href: "/askimate", aiIcon: true },
    { name: "Blog", href: "/blog" },
    { name: "Free Consultation", href: "/free-consultation" },
    { name: "Other Services", href: "/services" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || location !== "/"
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">

          {/* LEFT: Logo */}
          <div className="flex-shrink-0 cursor-pointer" onClick={() => handleNavClick("/")}>
            <img
              src={logoImg}
              alt="Universitio"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* CENTER: Nav links — absolutely centered on desktop */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            <div className="flex items-center gap-1">
              {navLinks.map((link) =>
                link.aiIcon ? (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.href)}
                    className="text-sm font-semibold text-primary flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/35 hover:scale-[1.03] transition-all duration-200 shadow-sm hover:shadow-[0_0_12px_rgba(66,20,125,0.18)]"
                    aria-label="AskiMate AI"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-primary nav-sparkle-icon" />
                    {link.name}
                  </button>
                ) : (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.href)}
                    className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-muted/50 whitespace-nowrap"
                  >
                    {link.name}
                  </button>
                )
              )}
            </div>
          </div>

          {/* RIGHT: CTA buttons */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white rounded-full px-5 shadow-md hover:shadow-lg hover:-translate-y-px transition-all flex items-center gap-1.5 whitespace-nowrap"
              onClick={() => setLocation("/askimate")}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Try AskiMate AI
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-5 font-medium border-primary/30 text-primary hover:bg-primary/5 whitespace-nowrap"
              onClick={() => setLocation("/assessment-form")}
            >
              Free Assessment
            </Button>
          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground p-2 focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b shadow-lg absolute w-full left-0">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) =>
              link.aiIcon ? (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.href)}
                  className="flex items-center gap-2 w-full text-left px-3 py-3 text-base font-semibold text-primary bg-primary/5 border border-primary/15 rounded-xl"
                >
                  <Sparkles className="w-4 h-4 text-primary nav-sparkle-icon" />
                  {link.name}
                </button>
              ) : (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.href)}
                  className="flex items-center gap-2 w-full text-left px-3 py-3 text-base font-medium text-foreground hover:bg-muted rounded-md"
                >
                  {link.name}
                </button>
              )
            )}
            <div className="pt-4 space-y-3">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6 flex items-center gap-2 justify-center"
                onClick={() => handleNavClick("/askimate")}
              >
                <Sparkles className="w-4 h-4" />
                Try AskiMate AI
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-xl py-6 border-primary/30 text-primary"
                onClick={() => handleNavClick("/assessment-form")}
              >
                Free Assessment
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
