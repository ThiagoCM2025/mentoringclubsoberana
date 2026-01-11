import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Lock, Calendar, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LiveSession {
  day: number;
  month: string;
  title: string;
  isUnlocked: boolean;
  youtubeId?: string;
}

const liveSessions: LiveSession[] = [
  { day: 12, month: "JAN", title: "Rotina e Processos", isUnlocked: true, youtubeId: "" },
  { day: 15, month: "JAN", title: "Captação Estratégica", isUnlocked: false },
  { day: 19, month: "JAN", title: "Inteligência Artificial", isUnlocked: false },
  { day: 22, month: "JAN", title: "Precificação de Elite", isUnlocked: false },
  { day: 26, month: "JAN", title: "Conversão de Vendas", isUnlocked: false },
];

export const JornadaVideoPlayer = () => {
  const [activeSession, setActiveSession] = useState(0);
  const currentSession = liveSessions[activeSession];

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
            {currentSession.isUnlocked && currentSession.youtubeId ? (
              <iframe
                src={`https://www.youtube.com/embed/${currentSession.youtubeId}?rel=0`}
                title={currentSession.title}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
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
                    <p className="text-cream/80 font-medium text-lg mb-2">{currentSession.title}</p>
                    <p className="text-cream/50 text-sm flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Disponível em {currentSession.day} de Janeiro
                    </p>
                  </>
                )}
              </div>
            )}
            
            {/* Current session indicator */}
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
          {liveSessions.map((session, index) => (
            <button
              key={index}
              onClick={() => setActiveSession(index)}
              className={`
                relative flex flex-col items-center p-3 md:p-4 rounded-xl border-2 transition-all duration-300 min-w-[80px] md:min-w-[100px]
                ${activeSession === index 
                  ? 'border-secondary bg-secondary/10 shadow-[0_0_20px_-5px_hsl(var(--secondary)/0.4)]' 
                  : session.isUnlocked 
                    ? 'border-cream/20 bg-cream/5 hover:border-secondary/50' 
                    : 'border-zinc-700 bg-zinc-800/50 opacity-60'
                }
              `}
            >
              <span className={`text-xl md:text-2xl font-bold ${activeSession === index ? 'text-secondary' : 'text-cream'}`}>
                {session.day}
              </span>
              <span className="text-[10px] md:text-xs text-cream/60 uppercase tracking-wider">
                {session.month}
              </span>
              {!session.isUnlocked && (
                <Lock className="w-3 h-3 text-zinc-500 absolute top-2 right-2" />
              )}
              {activeSession === index && (
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
          <span className="text-secondary">Dia {currentSession.day}:</span> {currentSession.title}
        </motion.p>
      </div>
    </section>
  );
};
