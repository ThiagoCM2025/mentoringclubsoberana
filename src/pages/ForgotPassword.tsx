import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Sparkles, Mail, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import isotipoGold from "@/assets/brand/isotipo-s-framed-gold.png";
import patternCirclesGold from "@/assets/brand/pattern-circles-gold.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Erro",
        description: "Por favor, insira seu email",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) throw error;
      
      setEmailSent(true);
      toast({ 
        title: "Email enviado!", 
        description: "Verifique sua caixa de entrada" 
      });
    } catch (error: any) {
      toast({ 
        title: "Erro", 
        description: error.message || "Erro ao enviar email", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left Side - Premium Black Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-secondary/5 blur-[100px]" />
          
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url(${patternCirclesGold})`,
              backgroundRepeat: 'repeat',
              backgroundSize: '300px',
            }}
          />
          
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-secondary/10 blur-[80px]" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-secondary/8 blur-[60px]" />
        </div>

        {/* Decorative lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
        <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 text-center"
        >
          {/* Premium Isotipo with glow effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mb-10"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-secondary/20 blur-2xl" />
            </div>
            
            <motion.img 
              src={isotipoGold} 
              alt="Soberana" 
              className="w-36 h-36 mx-auto relative z-10 drop-shadow-[0_0_30px_rgba(166,144,97,0.4)]"
              animate={{ 
                filter: [
                  "drop-shadow(0 0 20px rgba(166,144,97,0.3))",
                  "drop-shadow(0 0 40px rgba(166,144,97,0.5))",
                  "drop-shadow(0 0 20px rgba(166,144,97,0.3))"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Title with elegant styling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-secondary/60" />
              <Sparkles className="w-4 h-4 text-secondary" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-secondary/60" />
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-serif font-medium text-cream mb-4 tracking-wide">
              Recuperar <span className="text-secondary italic">Senha</span>
            </h1>
            
            <p className="text-cream/60 max-w-md mx-auto leading-relaxed text-lg">
              Enviaremos um link para o seu email para você criar uma nova senha.
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-cream">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <Link 
            to="/auth" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao login
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-24 rounded-full bg-secondary/10 blur-xl" />
              </div>
              <img 
                src={isotipoGold} 
                alt="Soberana" 
                className="w-20 h-20 relative z-10" 
              />
            </div>
          </div>

          {emailSent ? (
            /* Success State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-serif font-medium text-foreground mb-3">
                Email Enviado!
              </h2>
              <p className="text-muted-foreground mb-6">
                Enviamos um link de recuperação para <strong className="text-foreground">{email}</strong>. 
                Verifique sua caixa de entrada e spam.
              </p>
              <Button
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="mr-3"
              >
                Enviar novamente
              </Button>
              <Link to="/auth">
                <Button className="bg-black hover:bg-black/90 text-cream">
                  Voltar ao login
                </Button>
              </Link>
            </motion.div>
          ) : (
            /* Form State */
            <>
              <div className="mb-8">
                <h2 className="text-3xl sm:text-4xl font-serif font-medium text-foreground mb-2">
                  Esqueceu a senha?
                </h2>
                <p className="text-muted-foreground">
                  Informe seu email para receber o link de recuperação
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-12 bg-white border-border/50 focus:border-secondary focus:ring-secondary/20 transition-all"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-black hover:bg-black/90 text-cream font-medium text-base shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "Enviar link de recuperação"
                  )}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-border/30">
                <p className="text-center text-muted-foreground text-sm">
                  Lembrou a senha?{" "}
                  <Link to="/auth" className="text-secondary font-medium hover:underline">
                    Fazer login
                  </Link>
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
