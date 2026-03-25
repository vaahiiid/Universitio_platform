import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
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
    { name: "Our Services", href: "/services" },
    { name: "Agents", href: "/#agents" },
    { name: "Earn as a Student", href: "/#earn" },
    { name: "Contact", href: "/contact" },
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
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => handleNavClick("/")}>
            <img
              src={logoImg}
              alt="Universitio"
              className="h-10 w-auto object-contain"
            />
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <div className="flex space-x-6">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.href)}
                  className="text-sm font-medium text-foreground/75 hover:text-primary transition-colors"
                >
                  {link.name}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-3 pl-4 border-l border-border">
              <Button
                variant="ghost"
                size="sm"
                className="font-medium text-foreground/75 hover:text-primary"
                onClick={() => setLocation("/blog")}
              >
                Blog
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full px-5 font-medium border-primary/30 text-primary hover:bg-primary/5"
                onClick={() => setLocation("/assessment-form")}
              >
                Free Assessment
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white rounded-full px-5 shadow-md hover:shadow-lg hover:-translate-y-px transition-all"
                onClick={() => setLocation("/free-consultation")}
              >
                Free Consultation
              </Button>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground p-2 focus:outline-none"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b shadow-lg absolute w-full left-0">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-left px-3 py-3 text-base font-medium text-foreground hover:bg-muted rounded-md"
              >
                {link.name}
              </button>
            ))}
            <button
              onClick={() => handleNavClick("/blog")}
              className="block w-full text-left px-3 py-3 text-base font-medium text-foreground hover:bg-muted rounded-md"
            >
              Blog
            </button>
            <div className="pt-4 space-y-3">
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-6"
                onClick={() => handleNavClick("/free-consultation")}
              >
                Book Free Consultation
              </Button>
              <Button
                variant="outline"
                className="w-full rounded-xl py-6 border-primary/30 text-primary"
                onClick={() => handleNavClick("/assessment-form")}
              >
                Take Free Assessment
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
