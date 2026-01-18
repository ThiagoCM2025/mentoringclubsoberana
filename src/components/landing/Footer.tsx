import { motion } from "framer-motion";
import { Instagram, Linkedin, Youtube, Mail, Phone, MapPin, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import patternCirclesGold from "@/assets/brand/pattern-circles-gold.png";
import isotipoGold from "@/assets/brand/isotipo-gold.png";
import { SoberanaLogoMark } from "./SoberanaLogoMark";
import { APP_VERSION } from "@/App";

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/fabianaduarte.adv", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com/in/fabianaduarteadv", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com/@fabianaduarteadv", label: "YouTube" },
];

const quickLinks = [
  { label: "Sobre", href: "#sobre" },
  { label: "Programas", href: "#jornada" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "FAQ", href: "#faq" },
];

const legalLinks = [
  { label: "Política de Privacidade", href: "/privacidade" },
  { label: "Termos de Uso", href: "/termos" },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background relative overflow-hidden">
      {/* Top decorative golden border */}
      <div className="absolute top-0 left-0 w-full">
        <div className="h-1 bg-gradient-to-r from-transparent via-secondary to-transparent" />
        <div className="h-6 bg-gradient-to-b from-secondary/15 to-transparent" />
      </div>
      
      {/* Circle Pattern - top area */}
      <div 
        className="absolute top-0 left-0 w-full h-64 opacity-[0.08]"
        style={{
          backgroundImage: `url(${patternCirclesGold})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '280px',
          maskImage: 'linear-gradient(to bottom, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
        }}
      />

      {/* Isotipo Gold - watermark center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06]">
        <img src={isotipoGold} alt="" className="w-72 h-72" />
      </div>

      {/* Main Footer */}
      <div className="container-soberana px-4 sm:px-6 py-12 sm:py-16 pb-8 sm:pb-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 text-center sm:text-left">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="mb-5 sm:mb-6">
              <SoberanaLogoMark variant="light" size="md" />
            </div>
            <p className="text-background/70 mb-5 sm:mb-6 text-sm leading-relaxed max-w-xs">
              Transformando advogadas em CEOs dos seus próprios negócios através 
              da metodologia S.O.B.E.R.A.N.A.
            </p>
            <div className="flex gap-3 justify-center sm:justify-start">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-base sm:text-lg mb-3 sm:mb-4 tracking-wide">Links Rápidos</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={`/${link.href}`}
                    className="text-background/70 hover:text-secondary transition-colors text-sm tracking-wide"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/auth"
                  className="text-background/70 hover:text-secondary transition-colors text-sm tracking-wide"
                >
                  Área do Aluno
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-bold text-base sm:text-lg mb-3 sm:mb-4 tracking-wide">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-background/70">
                <Mail className="w-4 h-4 mt-0.5 text-secondary flex-shrink-0" />
                <a href="mailto:contato@soberanamentoria.com.br" className="hover:text-secondary transition-colors break-all sm:break-normal">
                  contato@soberanamentoria.com.br
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-background/70">
                <Phone className="w-4 h-4 mt-0.5 text-secondary flex-shrink-0" />
                <a href="https://wa.me/5511993563468" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                  (11) 99356-3468
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-background/70">
                <MapPin className="w-4 h-4 mt-0.5 text-secondary flex-shrink-0" />
                <span>São Paulo, SP - Brasil</span>
              </li>
            </ul>
          </div>

          {/* Legal & Admin */}
          <div>
            <h4 className="font-serif font-bold text-base sm:text-lg mb-3 sm:mb-4 tracking-wide">Legal</h4>
            <ul className="space-y-2 mb-4 sm:mb-6">
              {legalLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-background/70 hover:text-secondary transition-colors text-sm tracking-wide"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Admin Access */}
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-xs text-background/40 hover:text-background/60 transition-colors"
            >
              <Lock className="w-3 h-3" />
              Admin
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10 relative z-10">
        <div className="container-soberana py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/50 text-center">
            <p className="tracking-wide">
              © {currentYear} Soberana Mentoring Club. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-4">
              <p className="tracking-wide">
                Feito com <span className="text-secondary">♥</span> para advogadas extraordinárias
              </p>
              <Link 
                to="/clear-cache" 
                className="text-[10px] text-background/30 hover:text-secondary transition-colors"
                title="Limpar cache e atualizar"
              >
                v{APP_VERSION}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
