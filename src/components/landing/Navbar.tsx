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
  { label: "Blog", href: "/blog", isRoute: true },
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
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center cursor-pointer"
            >
              <SoberanaLogoMark 
                variant={isScrolled ? "scrolled" : "light"} 
                size="md" 
              />
            </button>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                link.isRoute ? (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`text-sm font-medium tracking-wide transition-all duration-300 hover:text-secondary relative group ${
                      isScrolled ? "text-foreground" : "text-primary-foreground"
                    }`}
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-secondary transition-all duration-300 group-hover:w-full" />
                  </Link>
                ) : (
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
                )
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-4">
              <Link to="/auth">
                <Button
                  variant="outline"
                  className={`tracking-wide font-medium transition-all duration-300 ${
                    isScrolled 
                      ? "border-foreground/50 text-foreground bg-foreground/5 hover:border-secondary hover:text-secondary hover:bg-secondary/10" 
                      : "border-cream text-cream bg-cream/15 hover:bg-cream/25 hover:border-cream"
                  }`}
                >
                  Área do Aluno
                </Button>
              </Link>
              <Button
                asChild
                className="cta-premium bg-secondary hover:bg-secondary/90 text-secondary-foreground tracking-wide"
              >
                <a href="#jornada">Quero Ser Soberana</a>
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
            className="fixed inset-0 z-40 bg-background pt-20 overflow-y-auto lg:hidden"
          >
            <div className="container-soberana px-4 py-6 pb-32 min-h-full">
              {/* Mobile Logo */}
              <div className="flex justify-center mb-6">
                <SoberanaLogoMark variant="dark" size="lg" />
              </div>
              
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  link.isRoute ? (
                    <Link
                      key={link.label}
                      to={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-base font-medium text-foreground py-3 px-2 border-b border-border/30 text-left tracking-wide hover:bg-muted/50 rounded-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <button
                      key={link.label}
                      onClick={() => scrollToSection(link.href)}
                      className="text-base font-medium text-foreground py-3 px-2 border-b border-border/30 text-left tracking-wide hover:bg-muted/50 rounded-sm transition-colors"
                    >
                      {link.label}
                    </button>
                  )
                ))}
                <div className="flex flex-col gap-3 mt-8 pt-4 border-t border-border/30">
                  <Button variant="outline" asChild className="w-full border-foreground/30 h-12 text-base">
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      Área do Aluno
                    </Link>
                  </Button>
                  <Button
                    className="w-full cta-premium bg-secondary hover:bg-secondary/90 text-secondary-foreground h-12 text-base"
                    onClick={() => scrollToSection("#jornada")}
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
