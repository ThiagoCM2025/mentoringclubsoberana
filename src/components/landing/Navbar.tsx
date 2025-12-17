import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { SoberanaLogoMark } from "./SoberanaLogoMark";

const navLinks = [
  { label: "Sobre", href: "#sobre" },
  { label: "Metodologia", href: "#metodologia" },
  { label: "A Jornada", href: "#jornada" },
  { label: "Trajetória", href: "#trajetoria" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "FAQ", href: "#faq" },
];

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (href: string) => {
    setIsMobileMenuOpen(false);
    const element = document.querySelector(href);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "bg-background/95 backdrop-blur-md shadow-md py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="container-soberana px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <SoberanaLogoMark 
                variant={isScrolled ? "scrolled" : "light"} 
                size="md" 
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => scrollToSection(link.href)}
                  className={`text-sm font-medium tracking-wide transition-all duration-300 hover:text-secondary relative group ${
                    isScrolled ? "text-foreground" : "text-primary-foreground"
                  }`}
                >
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-secondary transition-all duration-300 group-hover:w-full" />
                </button>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <Button
                variant="outline"
                asChild
                className={`tracking-wide font-medium transition-all duration-300 ${
                  isScrolled 
                    ? "border-foreground/30 text-foreground hover:border-secondary hover:text-secondary hover:bg-secondary/5" 
                    : "border-cream/40 text-cream hover:bg-cream/10 hover:border-cream/60 hover:text-cream"
                }`}
              >
                <Link to="/auth">Área do Aluno</Link>
              </Button>
              <Button
                asChild
                className="cta-premium bg-secondary hover:bg-secondary/90 text-secondary-foreground tracking-wide"
              >
                <a href="#captura">Quero Ser Soberana</a>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 ${
                isScrolled ? "text-foreground" : "text-primary-foreground"
              }`}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-background pt-24 lg:hidden"
          >
            <div className="container-soberana px-4 py-8">
              {/* Mobile Logo */}
              <div className="flex justify-center mb-8">
                <SoberanaLogoMark variant="dark" size="lg" />
              </div>
              
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => scrollToSection(link.href)}
                    className="text-lg font-medium text-foreground py-3 border-b border-border/50 text-left tracking-wide"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="flex flex-col gap-3 mt-6">
                  <Button variant="outline" asChild className="w-full border-foreground/30">
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      Área do Aluno
                    </Link>
                  </Button>
                  <Button
                    className="w-full cta-premium bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    onClick={() => scrollToSection("#captura")}
                  >
                    Quero Ser Soberana
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
