import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Download, CheckCircle2, Crown, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEventTracking } from "@/hooks/useEventTracking";

interface JornadaLeadFormProps {
  variant?: "hero" | "section";
  ctaText?: string;
  onAccessGranted?: (email: string) => void;
}

export const JornadaLeadForm = ({ variant = "section", ctaText = "QUERO ME INSCREVER AGORA", onAccessGranted }: JornadaLeadFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });
  const { trackFormStart, trackFormComplete } = useEventTracking();

  const handleInputFocus = () => {
    trackFormStart("jornada_imobiliaria_2026");
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
      
      // Use RPC function to upsert lead and get ID
      const { data: leadId, error: leadError } = await supabase.rpc('upsert_lead_and_return_id', {
        p_full_name: nameTrimmed,
        p_email: emailNormalized,
        p_phone: phoneTrimmed,
        p_source: "jornada_imobiliaria_2026"
      });

      if (leadError) {
        console.error("Lead upsert error:", leadError);
        throw leadError;
      }

      if (leadId) {
        localStorage.setItem("soberana_lead_id", leadId);
      }

      // Track form completion
      trackFormComplete("jornada_imobiliaria_2026", { source: "jornada_imobiliaria_2026" });

      // Register ebook download - O Mapa da Advocacia Imobiliária 2026
      await supabase.from("ebook_downloads").insert({
        email: emailNormalized,
        ebook_name: "Mapa Advocacia Imobiliária 2026",
        lead_id: leadId || null,
      });

      // Send confirmation email with Jornada materials
      try {
        await supabase.functions.invoke("send-ebook-email", {
          body: {
            name: nameTrimmed,
            email: emailNormalized,
            ebook_name: "Mapa Advocacia Imobiliária 2026",
          },
        });
      } catch (emailErr) {
        console.error("Email error:", emailErr);
      }

      localStorage.setItem("jornadaLeadSubmitted", "true");
      
      // Grant access to videos immediately
      if (onAccessGranted) {
        await onAccessGranted(emailNormalized);
      }
      
      setIsSuccess(true);
      toast.success("Inscrição confirmada! Verifique seu email.");
    } catch (error) {
      console.error("Error submitting lead:", error);
      toast.error("Erro ao enviar. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`text-center p-8 rounded-2xl ${variant === "hero" ? "bg-cream/10 backdrop-blur-sm border border-cream/20" : "bg-green-50 border border-green-200"}`}
      >
        <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${variant === "hero" ? "bg-green-500/20" : "bg-green-100"}`}>
          <CheckCircle2 className={`w-8 h-8 ${variant === "hero" ? "text-green-400" : "text-green-600"}`} />
        </div>
        <h3 className={`font-serif text-xl md:text-2xl font-bold mb-2 ${variant === "hero" ? "text-cream" : "text-green-800"}`}>
          Inscrição Confirmada!
        </h3>
        <p className={`mb-4 ${variant === "hero" ? "text-cream/80" : "text-green-700"}`}>
          Verifique seu email para receber o material de apoio e os lembretes das aulas.
        </p>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${variant === "hero" ? "bg-secondary/20 text-secondary" : "bg-green-100 text-green-700"}`}>
          <Gift className="w-4 h-4" />
          <span className="text-sm font-medium">Material enviado para seu email!</span>
        </div>
      </motion.div>
    );
  }

  if (variant === "hero") {
    return (
      <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto space-y-3">
        <Input
          type="text"
          placeholder="Seu nome completo"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          onFocus={handleInputFocus}
          className="bg-cream/10 border-cream/30 text-cream placeholder:text-cream/50 h-12 focus:border-secondary focus:ring-secondary/30"
          disabled={isLoading}
          required
        />
        <Input
          type="email"
          placeholder="Seu melhor email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="bg-cream/10 border-cream/30 text-cream placeholder:text-cream/50 h-12 focus:border-secondary focus:ring-secondary/30"
          disabled={isLoading}
          required
        />
        <Input
          type="tel"
          placeholder="WhatsApp (opcional)"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="bg-cream/10 border-cream/30 text-cream placeholder:text-cream/50 h-12 focus:border-secondary focus:ring-secondary/30"
          disabled={isLoading}
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-base tracking-wide cta-premium"
        >
          {isLoading ? (
            "Processando..."
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              {ctaText}
            </>
          )}
        </Button>
        <p className="text-center text-cream/50 text-xs">
          🔒 Seus dados estão seguros e protegidos
        </p>
      </form>
    );
  }

  return (
    <section id="inscricao" className="relative py-16 md:py-24 bg-brand-black overflow-hidden">
      {/* Background effects */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url('/assets/brand/pattern-circles-gold.png')`,
          backgroundSize: '150px',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container-soberana relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-xl mx-auto"
        >
          {/* Card with premium border */}
          <div className="relative p-[2px] rounded-2xl bg-gradient-to-br from-secondary via-gold-light to-secondary overflow-hidden">
            <div className="relative bg-zinc-900 rounded-[14px] p-6 md:p-8">
              {/* Decorative corners */}
              <div className="absolute top-4 left-4 w-8 h-[1px] bg-gradient-to-r from-secondary to-transparent" />
              <div className="absolute top-4 left-4 w-[1px] h-8 bg-gradient-to-b from-secondary to-transparent" />
              <div className="absolute top-4 right-4 w-8 h-[1px] bg-gradient-to-l from-secondary to-transparent" />
              <div className="absolute top-4 right-4 w-[1px] h-8 bg-gradient-to-b from-secondary to-transparent" />
              
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center border border-secondary/30">
                  <Crown className="w-8 h-8 text-secondary" />
                </div>
              </div>

              {/* Title */}
              <div className="text-center mb-6">
                <h3 className="font-serif text-2xl md:text-3xl text-cream mb-2">
                  Garanta Sua <span className="text-secondary">Vaga Gratuita</span>
                </h3>
                <p className="text-cream/70">
                  Receba os materiais exclusivos e lembretes das aulas
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  onFocus={handleInputFocus}
                  className="bg-zinc-800/50 border-zinc-700 text-cream placeholder:text-cream/40 h-12 focus:border-secondary focus:ring-secondary/30"
                  disabled={isLoading}
                  required
                />
                <Input
                  type="email"
                  placeholder="Seu melhor email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700 text-cream placeholder:text-cream/40 h-12 focus:border-secondary focus:ring-secondary/30"
                  disabled={isLoading}
                  required
                />
                <Input
                  type="tel"
                  placeholder="WhatsApp (opcional)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-zinc-800/50 border-zinc-700 text-cream placeholder:text-cream/40 h-12 focus:border-secondary focus:ring-secondary/30"
                  disabled={isLoading}
                />
                
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-14 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-base tracking-wide relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {isLoading ? "Processando..." : (
                        <>
                          <Download className="w-5 h-5" />
                          {ctaText}
                        </>
                      )}
                    </span>
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                    />
                  </Button>
                </motion.div>
              </form>

              {/* Trust text */}
              <p className="text-center text-cream/40 text-xs mt-4 flex items-center justify-center gap-1">
                <span>🔒</span> Seus dados estão seguros e protegidos
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
