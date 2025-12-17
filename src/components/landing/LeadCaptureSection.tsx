import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Gift, CheckCircle, Loader2 } from "lucide-react";
import { z } from "zod";
import patternGold from "@/assets/brand/pattern-gold.png";

const leadSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").max(100),
  email: z.string().email("Email inválido").max(255),
  phone: z.string().min(10, "Telefone inválido").max(20).optional(),
});

export const LeadCaptureSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = leadSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        title: "Erro no formulário",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Insert lead
      const { data: newLead, error: leadError } = await supabase
        .from("leads")
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          source: "landing_page_ebook",
          status: "new",
          temperature: "warm",
          score: 10,
        })
        .select("id")
        .single();

      if (leadError) throw leadError;

      // Register ebook download
      await supabase.from("ebook_downloads").insert({
        lead_id: newLead.id,
        email: formData.email,
        ebook_name: "7 Erros que Travam seu Escritório",
      });

      setIsSuccess(true);
      toast({
        title: "Sucesso!",
        description: "Você receberá nosso contato em breve.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section ref={ref} id="captura" className="section-padding bg-brand-black text-cream relative overflow-hidden">
      {/* Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url(${patternGold})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px',
        }}
      />

      {/* Decorative glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-secondary/10 blur-3xl" />

      <div className="container-soberana relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-secondary/30 bg-secondary/10 text-secondary">
              <Gift className="w-4 h-4" />
              <span className="text-sm font-medium">Material Exclusivo</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6">
              Pronta Para Dar o{" "}
              <span className="text-secondary">Primeiro Passo?</span>
            </h2>

            <p className="text-lg text-cream/80 mb-8">
              Cadastre-se e receba gratuitamente nosso guia exclusivo com os 
              <strong className="text-cream"> 7 erros que estão travando o crescimento do seu escritório</strong> 
              e como evitá-los.
            </p>

            <ul className="space-y-3">
              {[
                "Guia completo em PDF",
                "Checklist de implementação",
                "Acesso à comunidade gratuita",
                "Conteúdos exclusivos por email",
              ].map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3 text-cream/90"
                >
                  <CheckCircle className="w-5 h-5 text-secondary" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-cream text-foreground rounded-2xl p-8 shadow-2xl">
              {isSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-serif font-bold mb-2">Cadastro Realizado!</h3>
                  <p className="text-muted-foreground">
                    Verifique seu email para acessar o material exclusivo.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-serif font-bold text-foreground mb-2">
                    Quero Ser Soberana
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Preencha seus dados e comece sua transformação
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Input
                        placeholder="Seu nome completo"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="input-elegant"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        type="email"
                        placeholder="Seu melhor email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-elegant"
                        required
                      />
                    </div>
                    <div>
                      <Input
                        type="tel"
                        placeholder="WhatsApp (opcional)"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input-elegant"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-6 text-lg font-medium group"
                    >
                      {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Quero Receber o Material
                          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Ao se cadastrar, você concorda com nossa{" "}
                      <a href="#" className="text-secondary hover:underline">
                        Política de Privacidade
                      </a>
                    </p>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
