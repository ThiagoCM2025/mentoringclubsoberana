import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Award, BookOpen, Users, Star } from "lucide-react";
import mentorProfile from "@/assets/mentor-profile.jpg";

const achievements = [
  { icon: Users, value: "+500", label: "Advogadas Mentoradas" },
  { icon: Award, value: "15+", label: "Anos de Experiência" },
  { icon: BookOpen, value: "7", label: "Pilares Metodológicos" },
  { icon: Star, value: "4.9", label: "Avaliação Média" },
];

export const MentorSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="section-padding bg-muted/30">
      <div className="container-soberana">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative">
              {/* Gold Frame */}
              <div className="absolute -inset-4 border-2 border-secondary/30 rounded-lg" />
              <div className="absolute -inset-8 border border-secondary/10 rounded-lg" />
              
              <img
                src={mentorProfile}
                alt="Fabiana Duarte - Mentora"
                className="w-full rounded-lg shadow-elegant relative z-10"
              />
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground px-6 py-3 rounded-lg shadow-lg z-20">
                <p className="text-sm font-medium">Fundadora</p>
                <p className="text-lg font-serif font-bold">Soberana Club</p>
              </div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className="badge-gold mb-4">Sobre a Mentora</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">
              Fabiana Duarte
            </h2>
            <div className="space-y-4 text-muted-foreground mb-8">
              <p>
                Advogada há mais de 15 anos, Fabiana viveu na pele todos os desafios 
                de construir um escritório do zero. Passou por esgotamento, trabalhou 
                por honorários que não refletiam seu valor e sentiu a angústia de não 
                ter previsibilidade financeira.
              </p>
              <p>
                Até que decidiu mudar. Estudou gestão, negócios e liderança. Desenvolveu 
                uma metodologia própria que transformou sua advocacia em um negócio 
                estruturado e lucrativo.
              </p>
              <p className="font-medium text-foreground">
                Hoje, sua missão é ajudar outras advogadas a conquistarem a mesma 
                transformação através do Soberana Mentoring Club.
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
                  className="flex items-center gap-3 p-3 rounded-lg bg-background"
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