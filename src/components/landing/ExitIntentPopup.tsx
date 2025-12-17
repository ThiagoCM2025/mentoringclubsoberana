import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const ExitIntentPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  useEffect(() => {
    // Check if already shown this session
    const alreadyShown = sessionStorage.getItem("exitIntentShown");
    const alreadySubmitted = localStorage.getItem("leadSubmitted");
    
    if (alreadyShown || alreadySubmitted) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves from the top
      if (e.clientY <= 0 && !hasShown) {
        setShowPopup(true);
        setHasShown(true);
        sessionStorage.setItem("exitIntentShown", "true");
      }
    };

    // Add delay before enabling exit intent (don't show immediately)
    const timer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hasShown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }

    setIsLoading(true);

    try {
      // Insert lead
      const { data: leadData, error: leadError } = await supabase
        .from("leads")
        .insert({
          full_name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          source: "exit_intent_popup",
          status: "new",
          temperature: "warm",
          nurturing_active: true,
          nurturing_step: 0,
        })
        .select("id")
        .single();

      if (leadError) {
        // Check if it's a duplicate email
        if (leadError.code === "23505") {
          toast.info("Este email já está cadastrado! Verifique sua caixa de entrada.");
        } else {
          throw leadError;
        }
      } else {
        // Register ebook download
        await supabase.from("ebook_downloads").insert({
          email: formData.email.trim().toLowerCase(),
          ebook_name: "Checklist 5 Passos para Estruturar seu Escritório",
          lead_id: leadData?.id,
        });
      }

      localStorage.setItem("leadSubmitted", "true");
      toast.success("Sucesso! Verifique seu email para receber o checklist.");
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
          >
            <div className="relative bg-background border border-secondary/30 rounded-2xl shadow-2xl overflow-hidden">
              {/* Golden accent top border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-secondary via-secondary-light to-secondary" />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted/50"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 pt-10">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                    <Gift className="w-8 h-8 text-secondary" />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center mb-6">
                  <h3 className="font-serif text-2xl text-foreground mb-3">
                    Espera! Não vá ainda...
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Leve grátis nosso material exclusivo:
                  </p>
                  <p className="font-serif text-lg text-secondary font-medium">
                    "Checklist: 5 Passos para Estruturar seu Escritório de Advocacia"
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-muted/50 border-border/50 focus:border-secondary"
                    disabled={isLoading}
                  />
                  <Input
                    type="email"
                    placeholder="Seu melhor email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-muted/50 border-border/50 focus:border-secondary"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium py-6"
                    disabled={isLoading}
                  >
                    {isLoading ? "Enviando..." : "QUERO MEU CHECKLIST GRÁTIS"}
                  </Button>
                </form>

                {/* Trust text */}
                <p className="text-center text-xs text-muted-foreground mt-4">
                  🔒 Prometemos não enviar spam. Seus dados estão seguros.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
