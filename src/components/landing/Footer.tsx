import { motion } from "framer-motion";
import { Instagram, Linkedin, Youtube, Mail, Phone, MapPin, Lock } from "lucide-react";
import { Link } from "react-router-dom";

const socialLinks = [
  { icon: Instagram, href: "https://instagram.com/fabianaduarte.adv", label: "Instagram" },
  { icon: Linkedin, href: "https://linkedin.com/in/fabianaduarteadv", label: "LinkedIn" },
  { icon: Youtube, href: "https://youtube.com/@fabianaduarteadv", label: "YouTube" },
];

const quickLinks = [
  { label: "Sobre", href: "#sobre" },
  { label: "Programas", href: "#programas" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "FAQ", href: "#faq" },
];

const legalLinks = [
  { label: "Política de Privacidade", href: "/privacidade" },
  { label: "Termos de Uso", href: "/termos" },
];

const SoberanaLogo = () => (
  <div className="flex flex-col items-center leading-none">
    <span
      className="text-[10px] tracking-[0.3em] font-light uppercase text-background/60"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      Mentoring Club
    </span>
    <span className="text-secondary text-[8px] my-0.5">✦</span>
    <span
      className="text-xl font-semibold tracking-wide text-background"
      style={{ fontFamily: "'Cormorant Garamond', serif" }}
    >
      SOBERANA
    </span>
  </div>
);

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container-soberana section-padding pb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <div className="mb-6">
              <SoberanaLogo />
            </div>
            <p className="text-background/70 mb-6 text-sm leading-relaxed">
              Transformando advogadas em CEOs dos seus próprios negócios através 
              da metodologia S.O.B.E.R.A.N.A.
            </p>
            <div className="flex gap-3">
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
            <h4 className="font-serif font-bold text-lg mb-4 tracking-wide">Links Rápidos</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-background/70 hover:text-secondary transition-colors text-sm tracking-wide"
                  >
                    {link.label}
                  </a>
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
            <h4 className="font-serif font-bold text-lg mb-4 tracking-wide">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-sm text-background/70">
                <Mail className="w-4 h-4 mt-0.5 text-secondary" />
                <a href="mailto:contato@soberanamentoria.com.br" className="hover:text-secondary transition-colors">
                  contato@soberanamentoria.com.br
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-background/70">
                <Phone className="w-4 h-4 mt-0.5 text-secondary" />
                <a href="https://wa.me/5511993563468" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">
                  (11) 99356-3468
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-background/70">
                <MapPin className="w-4 h-4 mt-0.5 text-secondary" />
                <span>São Paulo, SP - Brasil</span>
              </li>
            </ul>
          </div>

          {/* Legal & Admin */}
          <div>
            <h4 className="font-serif font-bold text-lg mb-4 tracking-wide">Legal</h4>
            <ul className="space-y-2 mb-6">
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
      <div className="border-t border-background/10">
        <div className="container-soberana py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-background/50">
            <p className="tracking-wide">
              © {currentYear} Soberana Mentoring Club. Todos os direitos reservados.
            </p>
            <p className="tracking-wide">
              Feito com <span className="text-secondary">♥</span> para advogadas extraordinárias
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
