import { useState, useEffect, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const COOKIE_CONSENT_KEY = "soberana_cookie_consent";

export const CookieBanner = forwardRef<HTMLDivElement>((_, ref) => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Pequeno delay para não aparecer imediatamente
      const timer = setTimeout(() => setShowBanner(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
        >
          <div className="max-w-4xl mx-auto bg-card border border-border rounded-xl shadow-2xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">
                  🍪 Utilizamos cookies
                </h3>
                <p className="text-sm text-muted-foreground">
                  Usamos cookies para melhorar sua experiência, analisar o tráfego e personalizar conteúdo. 
                  Ao continuar navegando, você concorda com nossa{" "}
                  <a 
                    href="/privacidade" 
                    className="text-primary hover:underline"
                  >
                    Política de Privacidade
                  </a>.
                </p>
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={declineCookies}
                  className="flex-1 md:flex-none"
                >
                  Recusar
                </Button>
                <Button
                  size="sm"
                  onClick={acceptCookies}
                  className="flex-1 md:flex-none bg-primary hover:bg-primary/90"
                >
                  Aceitar
                </Button>
              </div>
              
              <button
                onClick={declineCookies}
                className="absolute top-2 right-2 md:static p-1 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

CookieBanner.displayName = "CookieBanner";

export default CookieBanner;
