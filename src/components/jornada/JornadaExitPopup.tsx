import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Sparkles, Gift, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEventTracking } from "@/hooks/useEventTracking";
import { useIsMobile } from "@/hooks/use-mobile";

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

export const JornadaExitPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const { trackFormStart, trackFormComplete } = useEventTracking();
  const isMobile = useIsMobile();
  
  const lastScrollY = useRef(0);
  const scrollUpDistance = useRef(0);
  const isActiveRef = useRef(false);

  // Desktop exit intent
  useEffect(() => {
    if (isMobile) return;
    
    const alreadyShown = sessionStorage.getItem("jornadaExitShown");
    const alreadySubmitted = localStorage.getItem("jornadaLeadSubmitted");
    
    if (alreadyShown || alreadySubmitted) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setShowPopup(true);
        setHasShown(true);
        sessionStorage.setItem("jornadaExitShown", "true");
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 8000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hasShown, isMobile]);

  // Mobile scroll-up detection
  useEffect(() => {
    if (!isMobile) return;
    
    const alreadyShown = sessionStorage.getItem("jornadaExitShown");
    const alreadySubmitted = localStorage.getItem("jornadaLeadSubmitted");
    
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
        scrollUpDistance.current += lastScrollY.current - currentScrollY;
        
        if (scrollUpDistance.current > 100 && scrollPercentage > 30) {
          setShowPopup(true);
          setHasShown(true);
          sessionStorage.setItem("jornadaExitShown", "true");
          window.removeEventListener("scroll", handleScroll);
        }
      } else {
        scrollUpDistance.current = 0;
      }
      
      lastScrollY.current = currentScrollY;
    };

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
    trackFormStart("jornada_exit_popup");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Por favor, preencha nome e email");
      return;
    }

    setIsLoading(true);

    try {
      const emailNormalized = formData.email.trim().toLowerCase();
      const nameTrimmed = formData.name.trim();
      const phoneTrimmed = formData.phone.trim() || null;
      
      const { data: leadId, error: leadError } = await supabase.rpc('upsert_lead_and_return_id', {
        p_full_name: nameTrimmed,
        p_email: emailNormalized,
        p_phone: phoneTrimmed,
        p_source: "jornada_exit_popup"
      });

      if (leadError) throw leadError;

      if (leadId) {
        localStorage.setItem("soberana_lead_id", leadId);
      }

      trackFormComplete("jornada_exit_popup", { source: "jornada_exit_popup" });

      await supabase.from("ebook_downloads").insert({
        email: emailNormalized,
        ebook_name: "Material Jornada Imobiliária 2026",
        lead_id: leadId || null,
      });

      try {
        await supabase.functions.invoke("send-ebook-email", {
          body: {
            name: nameTrimmed,
            email: emailNormalized,
            ebook_name: "Material Jornada Imobiliária 2026",
          },
        });
      } catch (emailErr) {
        console.error("Email error:", emailErr);
      }

      localStorage.setItem("jornadaLeadSubmitted", "true");
      setIsSuccess(true);
      toast.success("Inscrição confirmada! Verifique seu email.");
      
      setTimeout(() => setShowPopup(false), 3000);
    } catch (error) {
      console.error("Error:", error);
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            onClick={handleClose}
          />

          {/* Popup */}
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
              {/* Premium border */}
              <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-secondary via-gold-light to-secondary overflow-hidden shadow-[0_0_60px_-10px_hsl(var(--secondary)/0.5)]">
                {/* Shimmer */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ["-200%", "200%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                
                {/* Content */}
                <div className="relative bg-zinc-900 rounded-[14px] overflow-hidden">
                  {/* Decorative corners */}
                  <div className="absolute top-6 left-6 w-12 h-[1px] bg-gradient-to-r from-secondary to-transparent" />
                  <div className="absolute top-6 left-6 w-[1px] h-12 bg-gradient-to-b from-secondary to-transparent" />
                  <div className="absolute top-6 right-6 w-12 h-[1px] bg-gradient-to-l from-secondary to-transparent" />
                  <div className="absolute top-6 right-6 w-[1px] h-12 bg-gradient-to-b from-secondary to-transparent" />
                  
                  {/* Radial gradient */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--secondary)/0.05)_0%,transparent_70%)]" />
                  
                  {/* Close button */}
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-2 text-cream/60 hover:text-secondary transition-colors rounded-full hover:bg-secondary/10"
                    aria-label="Fechar"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <motion.div 
                    className="relative p-8 pt-12"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {isSuccess ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-4"
                      >
                        <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                          <CheckCircle2 className="w-8 h-8 text-green-400" />
                        </div>
                        <h3 className="font-serif text-xl text-cream mb-2">Inscrição Confirmada!</h3>
                        <p className="text-cream/70">Verifique seu email para os materiais.</p>
                      </motion.div>
                    ) : (
                      <>
                        {/* Icon */}
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
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <Crown className="w-10 h-10 text-secondary" />
                            <motion.div
                              className="absolute -top-1 -right-1"
                              animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Sparkles className="w-4 h-4 text-secondary" />
                            </motion.div>
                          </motion.div>
                        </motion.div>

                        {/* Title */}
                        <motion.div className="text-center mb-6" variants={itemVariants}>
                          <h3 className="font-serif text-2xl md:text-3xl text-cream mb-3 leading-tight">
                            Espera! <span className="text-secondary">Não vá ainda...</span>
                          </h3>
                          <p className="text-cream/70 mb-2">
                            Garanta acesso gratuito à <strong className="text-cream">Jornada Imobiliária 2026</strong>
                          </p>
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20">
                            <Gift className="w-4 h-4 text-secondary" />
                            <span className="text-sm text-secondary">+ Materiais Exclusivos</span>
                          </div>
                        </motion.div>

                        {/* Benefits */}
                        <motion.div className="flex flex-wrap justify-center gap-2 mb-6" variants={itemVariants}>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream/5 text-cream/70 text-xs">
                            <Clock className="w-3 h-3 text-secondary" />
                            <span>5 Lives Práticas</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream/5 text-cream/70 text-xs">
                            <Gift className="w-3 h-3 text-secondary" />
                            <span>Checklists</span>
                          </div>
                        </motion.div>

                        {/* Form */}
                        <motion.form onSubmit={handleSubmit} className="space-y-3" variants={itemVariants}>
                          <Input
                            type="text"
                            placeholder="Seu nome"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            onFocus={handleInputFocus}
                            className="bg-zinc-800/50 border-zinc-700 text-cream placeholder:text-cream/40 h-12 focus:border-secondary focus:ring-secondary/20"
                            disabled={isLoading}
                            required
                          />
                          <Input
                            type="email"
                            placeholder="Seu melhor email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="bg-zinc-800/50 border-zinc-700 text-cream placeholder:text-cream/40 h-12 focus:border-secondary focus:ring-secondary/20"
                            disabled={isLoading}
                            required
                          />
                          <Input
                            type="tel"
                            placeholder="WhatsApp (opcional)"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="bg-zinc-800/50 border-zinc-700 text-cream placeholder:text-cream/40 h-12 focus:border-secondary focus:ring-secondary/20"
                            disabled={isLoading}
                          />
                          
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              type="submit"
                              className="relative w-full h-14 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold tracking-wide overflow-hidden"
                              disabled={isLoading}
                            >
                              <span className="relative z-10">
                                {isLoading ? "Enviando..." : "QUERO PARTICIPAR GRÁTIS"}
                              </span>
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                                initial={{ x: "-100%" }}
                                animate={{ x: "200%" }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                              />
                            </Button>
                          </motion.div>
                        </motion.form>

                        <motion.p 
                          className="text-center text-xs text-cream/40 mt-4 flex items-center justify-center gap-1.5"
                          variants={itemVariants}
                        >
                          <span>🔒</span> Seus dados estão 100% seguros
                        </motion.p>
                      </>
                    )}
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
