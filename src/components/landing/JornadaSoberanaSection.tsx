import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Bot, MapPin, Rocket, Target, Crown } from "lucide-react";
import { ProgramCard } from "./ProgramCard";

const programs = [
  {
    icon: Bot,
    title: "Workshop Soberana IA",
    subtitle: "Seu Primeiro Passo",
    impactPhrase: "Ganhe tempo e autoridade com tecnologia.",
    description:
      "Domine as Inteligências Artificiais treinadas para advocacia. Recupere horas da sua semana com ajuda da IA no que é repetitivo e na criação de estratégias de negócios, produção de conteúdo e vendas.",
    deliverable: "Acesso às minhas IAs e Prompts exclusivos",
    cta: "Saiba Mais",
    ctaLink: "https://wa.me/5511999999999?text=Olá! Quero saber mais sobre o Workshop Soberana IA",
    tier: "entry",
  },
  {
    icon: MapPin,
    title: "Soberana Experience Start",
    subtitle: "O Despertar em SP",
    impactPhrase: "Networking e estratégia presencial mão na massa.",
    description:
      "Oficinas presenciais personalíssimas em São Paulo para apenas 12 mulheres. Um dia de imersão prática para destravar sua visão de negócio com networking premium.",
    deliverable: "Investimento: R$ 299 - Vagas Limitadas",
    cta: "Ver Próximas Datas",
    ctaLink: "https://wa.me/5511999999999?text=Olá! Quero saber as próximas datas do Experience Start em SP",
    tier: "entry",
  },
  {
    icon: Rocket,
    title: "Programa de Aceleração",
    subtitle: "90 Dias de Transformação",
    impactPhrase: "A fundação do seu escritório lucrativo.",
    description:
      "Mentoria em grupo focada nos 6 pilares: Mentalidade, Posicionamento, Marketing, Vendas, Precificação e Gestão. Estruture seu negócio jurídico do zero.",
    deliverable: "6 encontros quinzenais + Scripts de Vendas + Gestão com Auralex",
    cta: "Quero Estruturar Meu Negócio",
    ctaLink: "https://wa.me/5511999999999?text=Olá! Quero saber mais sobre o Programa de Aceleração de 90 dias",
    tier: "mid",
  },
  {
    icon: Target,
    title: "Mentoria Soberana 360°",
    subtitle: "Acompanhamento Semestral",
    impactPhrase: "Eu percorro o caminho com você.",
    description:
      "O acompanhamento de elite para quem quer escala. Aqui eu não apenas ensino, eu implemento junto com você cada estratégia do seu escritório.",
    deliverable: "Setup de Tráfego Pago feito por mim - Eu configuro suas campanhas ao seu lado",
    cta: "Aplicar para a Mentoria 360°",
    ctaLink: "https://wa.me/5511999999999?text=Olá! Quero me candidatar para a Mentoria Soberana 360°",
    tier: "mid",
    featured: true,
  },
  {
    icon: Crown,
    title: "Soberana Elite",
    subtitle: "Mastermind Anual",
    impactPhrase: "O próximo nível da liberdade e liderança jurídica.",
    description:
      "Para quem já deixou de ser apenas advogada e agora lidera um império. Foco em escala, liderança de associados, cultura empresarial e networking premium.",
    deliverable: "Retiro Soberano VIP + Conselho Consultivo Mensal + Suporte Prioritário",
    cta: "Consultar Condições de Admissão",
    ctaLink: "https://wa.me/5511999999999?text=Olá! Quero saber sobre as condições de admissão para o Soberana Elite",
    tier: "top",
  },
];

export const JornadaSoberanaSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const entryPrograms = programs.filter((p) => p.tier === "entry");
  const midPrograms = programs.filter((p) => p.tier === "mid");
  const topProgram = programs.find((p) => p.tier === "top");

  return (
    <section ref={ref} id="programas" className="section-padding bg-muted/30 overflow-hidden">
      <div className="container-soberana">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="badge-gold mb-4">A Jornada</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
            O Ecossistema Soberana:{" "}
            <span className="text-primary">Do Digital ao Presencial</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Escolha o programa ideal para o seu momento. Da entrada à elite, 
            cada passo te leva mais perto da liberdade que você merece.
          </p>
        </motion.div>

        {/* Pyramid Layout */}
        <div className="max-w-6xl mx-auto">
          {/* Top - Elite (Mastermind Anual) */}
          {topProgram && (
            <div className="flex justify-center mb-8">
              <div className="w-full max-w-md">
                <ProgramCard
                  icon={topProgram.icon}
                  title={topProgram.title}
                  subtitle={topProgram.subtitle}
                  impactPhrase={topProgram.impactPhrase}
                  description={topProgram.description}
                  deliverable={topProgram.deliverable}
                  cta={topProgram.cta}
                  ctaLink={topProgram.ctaLink}
                  featured={false}
                  delay={0.1}
                />
              </div>
            </div>
          )}

          {/* Middle - Aceleração e 360° */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {midPrograms.map((program, index) => (
              <ProgramCard
                key={program.title}
                icon={program.icon}
                title={program.title}
                subtitle={program.subtitle}
                impactPhrase={program.impactPhrase}
                description={program.description}
                deliverable={program.deliverable}
                cta={program.cta}
                ctaLink={program.ctaLink}
                featured={program.featured}
                delay={0.2 + index * 0.1}
              />
            ))}
          </div>

          {/* Entry - Workshop e Experience */}
          <div className="grid md:grid-cols-2 gap-6">
            {entryPrograms.map((program, index) => (
              <ProgramCard
                key={program.title}
                icon={program.icon}
                title={program.title}
                subtitle={program.subtitle}
                impactPhrase={program.impactPhrase}
                description={program.description}
                deliverable={program.deliverable}
                cta={program.cta}
                ctaLink={program.ctaLink}
                delay={0.4 + index * 0.1}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Não sabe qual programa é ideal para você?
          </p>
          <a
            href="https://wa.me/5511999999999?text=Olá! Preciso de ajuda para escolher o programa ideal para mim"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:text-secondary/80 font-semibold underline underline-offset-4 transition-colors"
          >
            Fale com nossa equipe e receba uma orientação personalizada →
          </a>
        </motion.div>
      </div>
    </section>
  );
};
