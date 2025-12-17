import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Building2, Bot, TrendingUp, Briefcase } from "lucide-react";
import mentorFabiana from "@/assets/mentor-fabiana.jpeg";

const achievements = [
  { icon: Briefcase, value: "+10 Anos", label: "no Direito Imobiliário" },
  { icon: Building2, value: "2", label: "Escritórios Boutique" },
  { icon: Bot, value: "Expert", label: "em IA Jurídica" },
  { icon: TrendingUp, value: "Tráfego", label: "Pago para Advogadas" },
];

export const MentorSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="sobre" className="section-padding bg-muted/30">
      <div className="container-soberana">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative">
              {/* Gold Frame */}
              <div className="absolute -inset-4 border-2 border-secondary/30 rounded-lg" />
              <div className="absolute -inset-8 border border-secondary/10 rounded-lg" />

              <img
                src={mentorFabiana}
                alt="Fabiana Duarte - Mentora para Advogadas"
                className="w-full rounded-lg shadow-elegant relative z-10"
              />

              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg z-20">
                <p className="text-sm font-medium">Advogada & Mentora</p>
                <p className="text-lg font-serif font-bold">Fabiana Duarte</p>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <span className="badge-gold mb-4">Quem Conduz a Sua Jornada?</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">
              Fabiana Duarte
            </h2>
            <div className="space-y-4 text-muted-foreground mb-8">
              <p className="text-lg">
                <span className="text-foreground font-medium">
                  Advogada no Imobiliário há mais de uma década
                </span>
                , empresária jurídica e especialista em soluções tecnológicas.
              </p>
              <p>
                Após construir dois escritórios boutique e desenvolver habilidades 
                que vão muito além do Direito, decidi ensinar o que o mercado não 
                mostra: <strong className="text-foreground">como trabalhar menos, faturar mais 
                e ter um posicionamento que impõe respeito e gera lucro</strong>.
              </p>
              <p className="text-lg font-medium text-foreground border-l-4 border-secondary pl-4">
                Minha missão é transformar advogadas estagnadas em líderes 
                soberanas de seus próprios negócios.
              </p>
            </div>

            {/* Achievements */}
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="flex items-center gap-3 p-4 rounded-lg bg-background border border-border"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <achievement.icon className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{achievement.value}</p>
                    <p className="text-xs text-muted-foreground">{achievement.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
