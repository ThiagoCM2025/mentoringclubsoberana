import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Lock, Calendar, Clock, Loader2, FileText, Download, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface LiveSession {
  day: number;
  month: string;
  title: string;
  isUnlocked: boolean;
  youtubeId?: string;
  materialsUrl?: string;
}

interface JornadaVideoPlayerProps {
  hasAccess: boolean;
  isCheckingAccess: boolean;
  onRequestAccess: () => void;
}

// Fallback para quando o banco não responder
const fallbackSessions: LiveSession[] = [
  { day: 12, month: "JAN", title: "Como organizar sua rotina e processos para escalar no Direito Imobiliário sem surtar", isUnlocked: true },
  { day: 15, month: "JAN", title: "Passo a passo para fechar contratos com clientes qualificados no imobiliário", isUnlocked: false },
  { day: 19, month: "JAN", title: "Encontro com Mentoradas sobre Criação de Conteúdo", isUnlocked: false },
  { day: 22, month: "JAN", title: "Passo a passo para criar uma tabela de precificação eficiente", isUnlocked: false },
  { day: 26, month: "JAN", title: "Como converter consultas em contratos de alto valor", isUnlocked: false },
];

export const JornadaVideoPlayer = ({ hasAccess, isCheckingAccess, onRequestAccess }: JornadaVideoPlayerProps) => {
  const [activeSession, setActiveSession] = useState(0);
  const [sessions, setSessions] = useState<LiveSession[]>(fallbackSessions);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSessions = async () => {
      const { data, error } = await supabase
        .from("jornada_sessions")
        .select("*")
        .eq("jornada_slug", "imobiliaria-2026")
        .order("order_index");

      if (!error && data && data.length > 0) {
        setSessions(data.map(s => ({
          day: s.session_day,
          month: s.session_month,
          title: s.title,
          isUnlocked: s.is_unlocked,
          youtubeId: s.youtube_id || "",
          materialsUrl: s.materials_url || undefined,
        })));
      }
      setLoading(false);
    };
    
    fetchSessions();
  }, []);

  const currentSession = sessions[activeSession];

  if (loading || isCheckingAccess) {
    return (
      <section className="relative py-16 md:py-24 bg-brand-black overflow-hidden">
        <div className="container-soberana flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-16 md:py-24 bg-brand-black overflow-hidden">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url('/assets/brand/pattern-circles-gold.png')`,
          backgroundSize: '150px',
        }}
      />
      
      <div className="container-soberana relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <Badge className="bg-secondary/20 text-secondary border-secondary/30 mb-4">
            <Play className="w-3 h-3 mr-1" />
            AULAS GRAVADAS
          </Badge>
          <h2 className="font-serif text-2xl md:text-4xl text-cream mb-4">
            Assista às <span className="text-secondary">Lives Gravadas</span>
          </h2>
          <p className="text-cream/70 max-w-2xl mx-auto">
            Cada encontro foi pensado para você aplicar imediatamente no seu escritório.
          </p>
        </motion.div>

        {/* Video Player Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="relative aspect-video max-w-4xl mx-auto rounded-xl overflow-hidden border-2 border-secondary/30 bg-zinc-900">
            {/* Access Gate Overlay - Shows when user hasn't registered */}
            {!hasAccess && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center p-6 max-w-md"
                >
                  <div className="w-20 h-20 mx-auto rounded-full bg-secondary/20 flex items-center justify-center mb-4 border border-secondary/30">
                    <Lock className="w-10 h-10 text-secondary" />
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl text-cream mb-3">
                    Conteúdo <span className="text-secondary">Exclusivo</span>
                  </h3>
                  <p className="text-cream/70 mb-6 text-sm md:text-base">
                    Inscreva-se gratuitamente para assistir às lives gravadas e baixar os materiais de apoio.
                  </p>
                  <Button 
                    onClick={onRequestAccess}
                    size="lg"
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold px-8 py-6 text-base shadow-[0_0_30px_rgba(166,144,97,0.3)]"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    QUERO ME INSCREVER
                  </Button>
                  <p className="text-cream/40 text-xs mt-4">
                    🔒 100% gratuito • Acesso imediato
                  </p>
                </motion.div>
              </div>
            )}

            {/* Video Content - Only visible when user has access */}
            {hasAccess && currentSession.isUnlocked && currentSession.youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${currentSession.youtubeId}?rel=0`}
                title={currentSession.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : hasAccess ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
                {currentSession.isUnlocked ? (
                  <>
                    <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mb-4 border border-secondary/30">
                      <Play className="w-10 h-10 text-secondary ml-1" />
                    </div>
                    <p className="text-cream font-medium text-lg mb-2">{currentSession.title}</p>
                    <p className="text-cream/60 text-sm">Em breve o vídeo estará disponível</p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mb-4 border border-zinc-700">
                      <Lock className="w-10 h-10 text-zinc-500" />
                    </div>
                    <p className="text-cream/80 font-medium text-lg mb-2 text-center px-4">{currentSession.title}</p>
                    <p className="text-cream/50 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Disponível em {currentSession.day} de Janeiro
                    </p>
                  </>
                )}
              </div>
            ) : (
              // Blurred preview for non-registered users
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 blur-sm opacity-50">
                <div className="w-20 h-20 rounded-full bg-secondary/20 flex items-center justify-center mb-4 border border-secondary/30">
                  <Play className="w-10 h-10 text-secondary ml-1" />
                </div>
              </div>
            )}
            
            {/* Current session indicator - Only when has access */}
            {hasAccess && (
              <div className="absolute top-4 left-4 z-10">
                <Badge className={`${currentSession.isUnlocked ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-zinc-700/80 text-zinc-400 border-zinc-600'}`}>
                  {currentSession.isUnlocked ? (
                    <>
                      <Clock className="w-3 h-3 mr-1" />
                      Disponível Agora
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 mr-1" />
                      Bloqueado
                    </>
                  )}
                </Badge>
              </div>
            )}

            {/* Material download button - Only when has access */}
            {hasAccess && currentSession.isUnlocked && currentSession.materialsUrl && (
              <div className="absolute top-4 right-4 z-10">
                <a href={currentSession.materialsUrl} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="secondary" className="gap-2">
                    <Download className="w-4 h-4" />
                    Material
                  </Button>
                </a>
              </div>
            )}
          </div>
        </motion.div>

        {/* Session Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 md:gap-4"
        >
          {sessions.map((session, index) => (
            <button
              key={index}
              onClick={() => hasAccess ? setActiveSession(index) : onRequestAccess()}
              className={`
                relative flex flex-col items-center p-3 md:p-4 rounded-xl border-2 transition-all duration-300 min-w-[80px] md:min-w-[100px]
                ${!hasAccess 
                  ? 'border-zinc-700 bg-zinc-800/50 opacity-60 cursor-pointer hover:opacity-80' 
                  : activeSession === index 
                    ? 'border-secondary bg-secondary/10 shadow-[0_0_20px_-5px_hsl(var(--secondary)/0.4)]' 
                    : session.isUnlocked 
                      ? 'border-cream/20 bg-cream/5 hover:border-secondary/50' 
                      : 'border-zinc-700 bg-zinc-800/50 opacity-60'
                }
              `}
            >
              <span className={`text-xl md:text-2xl font-bold ${!hasAccess ? 'text-zinc-500' : activeSession === index ? 'text-secondary' : 'text-cream'}`}>
                {session.day}
              </span>
              <span className="text-[10px] md:text-xs text-cream/60 uppercase tracking-wider">
                {session.month}
              </span>
              {(!hasAccess || !session.isUnlocked) && (
                <Lock className="w-3 h-3 text-zinc-500 absolute top-2 right-2" />
              )}
              {hasAccess && session.materialsUrl && session.isUnlocked && (
                <FileText className="w-3 h-3 text-secondary absolute top-2 right-2" />
              )}
              {hasAccess && activeSession === index && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-secondary rounded-full"
                />
              )}
            </button>
          ))}
        </motion.div>

        {/* Current session title */}
        <motion.p
          key={activeSession}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-6 text-cream font-medium"
        >
          {hasAccess ? (
            <>
              <span className="text-secondary">Dia {currentSession.day}:</span> {currentSession.title}
            </>
          ) : (
            <span className="text-cream/60">Inscreva-se para desbloquear as aulas</span>
          )}
        </motion.p>
      </div>
    </section>
  );
};