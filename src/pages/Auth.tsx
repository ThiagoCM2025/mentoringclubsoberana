import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { z } from "zod";
import isotipoGold from "@/assets/brand/isotipo-s-framed-gold.png";
import patternCirclesGold from "@/assets/brand/pattern-circles-gold.png";

const authSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate(isAdmin ? "/admin" : "/student");
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = authSchema.safeParse({ email, password });
    if (!validation.success) {
      toast({
        title: "Erro",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast({ title: "Bem-vinda de volta!" });
    } catch (error: any) {
      const message = error.message === "Invalid login credentials" 
        ? "Email ou senha incorretos" 
        : error.message;
      toast({ title: "Erro", description: message, variant: "destructive" });
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
          {/* Central glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-secondary/5 blur-[100px]" />
          
          {/* Golden pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url(${patternCirclesGold})`,
              backgroundRepeat: 'repeat',
              backgroundSize: '300px',
            }}
          />
          
          {/* Top glow */}
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-secondary/10 blur-[80px]" />
          
          {/* Bottom glow */}
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
            {/* Glow ring behind */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full bg-secondary/20 blur-2xl" />
            </div>
            
            {/* Isotipo */}
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
              Área do <span className="text-secondary italic">Aluno</span>
            </h1>
            
            <p className="text-cream/60 max-w-md mx-auto leading-relaxed text-lg">
              Acesse seus cursos, materiais e acompanhe sua evolução na jornada para se tornar uma{" "}
              <span className="text-secondary font-medium">advogada soberana</span>.
            </p>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 flex items-center justify-center gap-8"
          >
            <div className="flex items-center gap-2 text-cream/40">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <span className="text-sm">Acesso exclusivo</span>
            </div>
            <div className="flex items-center gap-2 text-cream/40">
              <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <span className="text-sm">Conteúdo premium</span>
            </div>
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
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao site
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

          {/* Form header */}
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-foreground mb-2">
              Entrar
            </h2>
            <p className="text-muted-foreground">
              Acesse sua conta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <Input
                type="email"
                placeholder="Seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-white border-border/50 focus:border-secondary focus:ring-secondary/20 transition-all"
                required
              />
            </div>
            
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-white border-border/50 focus:border-secondary focus:ring-secondary/20 pr-12 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-black hover:bg-black/90 text-cream font-medium text-base shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Entrar
                  <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </form>

          {/* Footer text */}
          <div className="mt-8 pt-6 border-t border-border/30">
            <p className="text-center text-muted-foreground text-sm">
              Acesso exclusivo para alunas matriculadas
            </p>
            <p className="text-center text-xs text-muted-foreground/60 mt-2">
              Problemas com acesso?{" "}
              <a 
                href="https://wa.me/5511993563468?text=Olá! Preciso de ajuda com meu acesso à área do aluno"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:underline"
              >
                Fale conosco
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;