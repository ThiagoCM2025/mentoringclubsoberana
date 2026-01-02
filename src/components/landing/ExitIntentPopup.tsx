import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEventTracking } from "@/hooks/useEventTracking";
import { useIsMobile } from "@/hooks/use-mobile";

// Animation variants for staggered entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 25, stiffness: 300 },
  },
};

export const ExitIntentPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const { trackFormStart, trackFormComplete, linkEventsToLead, trackCTAClick } = useEventTracking();
  const isMobile = useIsMobile();
  
  // Refs for mobile scroll detection
  const lastScrollY = useRef(0);
  const scrollUpDistance = useRef(0);
  const isActiveRef = useRef(false);

  // Desktop exit intent (mouseleave)
  useEffect(() => {
    if (isMobile) return;
    
    const alreadyShown = sessionStorage.getItem("exitIntentShown");
    const alreadySubmitted = localStorage.getItem("leadSubmitted");
    
    if (alreadyShown || alreadySubmitted) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setShowPopup(true);
        setHasShown(true);
        sessionStorage.setItem("exitIntentShown", "true");
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hasShown, isMobile]);

  // Mobile exit intent (scroll-up detection)
  useEffect(() => {
    if (!isMobile) return;
    
    const alreadyShown = sessionStorage.getItem("exitIntentShown");
    const alreadySubmitted = localStorage.getItem("leadSubmitted");
    
    if (alreadyShown || alreadySubmitted) {
      setHasShown(true);
      return;
    }

    const handleScroll = () => {
      if (!isActiveRef.current || hasShown) return;
      
      const currentScrollY = window.scrollY;
      const pageHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = (currentScrollY / pageHeight) * 100;
      
      if (currentScrollY < lastScrollY.current) {
        // Scrolling up
        scrollUpDistance.current += lastScrollY.current - currentScrollY;
        
        // Trigger if scrolled 30%+ of page AND scrolled up 100px+
        if (scrollUpDistance.current > 100 && scrollPercentage > 30) {
          setShowPopup(true);
          setHasShown(true);
          sessionStorage.setItem("exitIntentShown", "true");
          window.removeEventListener("scroll", handleScroll);
        }
      } else {
        // Scrolling down - reset counter
        scrollUpDistance.current = 0;
      }
      
      lastScrollY.current = currentScrollY;
    };

    // Activate after 8 seconds on mobile
    const timer = setTimeout(() => {
      lastScrollY.current = window.scrollY;
      isActiveRef.current = true;
      window.addEventListener("scroll", handleScroll, { passive: true });
    }, 8000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasShown, isMobile]);

  const handleInputFocus = () => {
    trackFormStart("exit_intent_popup");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setIsLoading(true);

    try {
      const emailNormalized = formData.email.trim().toLowerCase();
      const nameTrimmed = formData.name.trim();
      const phoneTrimmed = formData.phone.trim() || null;
      const ebookName = "7 Erros que Travam seu Escritório";
      
      // Use RPC function to upsert lead and get ID (bypasses RLS for anonymous users)
      const { data: leadId, error: leadError } = await supabase.rpc('upsert_lead_and_return_id', {
        p_full_name: nameTrimmed,
        p_email: emailNormalized,
        p_phone: phoneTrimmed,
        p_source: "exit_intent_popup"
      });

      if (leadError) {
        console.error("Lead upsert error:", leadError);
      }

      // Track form completion
      trackFormComplete("exit_intent_popup", { source: "exit_intent_popup" });

      // Register ebook download WITH lead_id
      await supabase.from("ebook_downloads").insert({
        email: emailNormalized,
        ebook_name: ebookName,
        lead_id: leadId || null,
      });

      // Send ebook email via edge function
      try {
        const { error: emailError } = await supabase.functions.invoke("send-ebook-email", {
          body: {
            name: nameTrimmed,
            email: emailNormalized,
            ebook_name: ebookName,
          },
        });
        
        if (emailError) {
          console.error("Error sending ebook email:", emailError);
        }
      } catch (emailErr) {
        console.error("Failed to send ebook email:", emailErr);
        // Don't fail the whole submission if email fails
      }

      localStorage.setItem("leadSubmitted", "true");
      toast.success("Sucesso! Verifique seu email para receber o guia.");
      setShowPopup(false);
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowPopup(false);
  };

  return (
    <AnimatePresence>
      {showPopup && (
        <>
          {/* Backdrop with premium blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            onClick={handleClose}
          />

          {/* Popup Container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 40 }}
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              className="w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Premium border wrapper with animated gradient */}
              <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-secondary via-gold-light to-secondary overflow-hidden shadow-[0_0_60px_-10px_hsl(var(--secondary)/0.5)]">
                {/* Animated shimmer on border */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Inner content container */}
                <div className="relative bg-background rounded-[14px] overflow-hidden">
                  {/* Decorative corner ornaments */}
                  <div className="absolute top-6 left-6 w-12 h-[1px] bg-gradient-to-r from-secondary to-transparent" />
                  <div className="absolute top-6 left-6 w-[1px] h-12 bg-gradient-to-b from-secondary to-transparent" />
                  <div className="absolute top-6 right-6 w-12 h-[1px] bg-gradient-to-l from-secondary to-transparent" />
                  <div className="absolute top-6 right-6 w-[1px] h-12 bg-gradient-to-b from-secondary to-transparent" />
                  
                  {/* Subtle radial gradient background */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--secondary)/0.05)_0%,transparent_70%)]" />
                  
                  {/* Close button */}
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-2 text-muted-foreground hover:text-secondary transition-colors duration-300 rounded-full hover:bg-secondary/10"
                    aria-label="Fechar"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Content with staggered animations */}
                  <motion.div 
                    className="relative p-8 pt-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {/* Animated Icon */}
                    <motion.div 
                      className="flex justify-center mb-6"
                      variants={itemVariants}
                    >
                      <motion.div 
                        className="relative w-20 h-20 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center border border-secondary/30"
                        animate={{ 
                          y: [0, -6, 0],
                          boxShadow: [
                            "0 0 20px 0 hsl(var(--secondary)/0.2)",
                            "0 0 30px 5px hsl(var(--secondary)/0.3)",
                            "0 0 20px 0 hsl(var(--secondary)/0.2)"
                          ]
                        }}
                        transition={{ 
                          duration: 3, 
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Crown className="w-10 h-10 text-secondary" />
                        {/* Sparkle accents */}
                        <motion.div
                          className="absolute -top-1 -right-1"
                          animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.7, 1, 0.7]
                          }}
                          transition={{ duration: 2, repeat: Infinity, type: "tween" }}
                        >
                          <Sparkles className="w-4 h-4 text-secondary" />
                        </motion.div>
                      </motion.div>
                    </motion.div>

                    {/* Title with elegant typography */}
                    <motion.div 
                      className="text-center mb-6"
                      variants={itemVariants}
                    >
                      <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-3 leading-tight">
                        Espera! <span className="text-secondary">Não vá ainda...</span>
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Leve grátis nosso material exclusivo:
                      </p>
                      <p className="font-serif text-lg text-secondary font-medium italic leading-relaxed">
                        "7 Erros que Estão Travando o Crescimento do Seu Escritório"
                      </p>
                    </motion.div>

                    {/* Premium Form */}
                    <motion.form 
                      onSubmit={handleSubmit} 
                      className="space-y-3"
                      variants={itemVariants}
                    >
                      <Input
                        type="text"
                        placeholder="Seu nome"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        onFocus={handleInputFocus}
                        className="bg-cream/30 border-secondary/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-300 placeholder:text-muted-foreground/60 placeholder:italic h-12"
                        disabled={isLoading}
                        required
                      />
                      <Input
                        type="email"
                        placeholder="Seu melhor email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-cream/30 border-secondary/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-300 placeholder:text-muted-foreground/60 placeholder:italic h-12"
                        disabled={isLoading}
                        required
                      />
                      <Input
                        type="tel"
                        placeholder="WhatsApp (opcional)"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-cream/30 border-secondary/20 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all duration-300 placeholder:text-muted-foreground/60 placeholder:italic h-12"
                        disabled={isLoading}
                      />
                      
                      {/* Premium CTA Button with shimmer */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button
                          type="submit"
                          className="relative w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold py-6 text-base tracking-wide overflow-hidden group"
                          disabled={isLoading}
                        >
                          <span className="relative z-10">
                            {isLoading ? "Enviando..." : "QUERO MEU CHECKLIST GRÁTIS"}
                          </span>
                          {/* Shimmer effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                            initial={{ x: "-100%" }}
                            animate={{ x: "200%" }}
                            transition={{ 
                              duration: 2, 
                              repeat: Infinity, 
                              ease: "linear",
                              repeatDelay: 1
                            }}
                          />
                        </Button>
                      </motion.div>
                    </motion.form>

                    {/* Trust text with icon */}
                    <motion.p 
                      className="text-center text-xs text-muted-foreground mt-5 flex items-center justify-center gap-1.5"
                      variants={itemVariants}
                    >
                      <span className="text-secondary">🔒</span>
                      Prometemos não enviar spam. Seus dados estão seguros.
                    </motion.p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
