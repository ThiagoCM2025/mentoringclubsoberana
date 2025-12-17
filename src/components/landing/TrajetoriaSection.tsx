import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import mentorSobre from "@/assets/mentor-sobre.jpg";
import patternCirclesGold from "@/assets/brand/pattern-circles-gold.png";
import isotipoGold from "@/assets/brand/isotipo-gold.png";

export const TrajetoriaSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-20 md:py-32 bg-brand-black relative overflow-hidden">
      {/* Circle Pattern Background */}
      <div 
        className="absolute inset-0 opacity-[0.10]"
        style={{
          backgroundImage: `url(${patternCirclesGold})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '280px',
        }}
      />
      
      {/* Isotipo Gold - right side decorative */}
      <div className="absolute top-1/4 right-8 opacity-[0.20] hidden lg:block animate-float-slow">
        <img src={isotipoGold} alt="" className="w-32 h-32" />
      </div>
      
      {/* Isotipo Gold - bottom left */}
      <div className="absolute bottom-20 left-12 opacity-[0.15] hidden lg:block animate-float-slow animation-delay-1000">
        <img src={isotipoGold} alt="" className="w-24 h-24" />
      </div>
      
      {/* Subtle decorative lines */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent" />
      
      {/* Golden glow behind image */}
      <div className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full bg-secondary/8 blur-3xl hidden lg:block" />
      
      <div className="container-soberana relative z-10">
        <div ref={ref} className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="order-2 lg:order-1"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium text-cream mb-8 leading-tight">
              Comecei minha trajetória{" "}
              <em className="italic text-secondary">como muitas advogadas:</em>
            </h2>
            
            <div className="space-y-5 text-cream/80 leading-relaxed">
              <p>
                Com um forte domínio técnico, dedicação à advocacia e o desejo de construir uma carreira sólida. Mas, com o tempo, percebi que apenas a técnica não bastava. Eu me sentia sobrecarregada, sem clareza de direção e longe da visão de liberdade e realização que sonhei quando escolhi o Direito.
              </p>
              
              <p className="text-cream font-medium">
                Foi quando decidi parar de operar apenas como uma advogada prestadora de serviços e comecei a enxergar minha advocacia como um negócio jurídico.
              </p>
              
              <p>
                Estudei gestão, posicionamento, branding, vendas, estratégia e, principalmente, desenvolvi uma nova identidade como líder dos meus próprios escritórios. Entendi que o que faltava não era esforço, mas sim estrutura, visão empresarial e posicionamento estratégico.
              </p>
              
              <p>
                Dessa virada nasceu a <strong className="text-secondary">Metodologia SOBERANA</strong>, um caminho claro, elegante e transformador para outras advogadas que também desejam sair da estagnação e assumirem o comando da própria jornada.
              </p>
              
              <p>
                Hoje, conduzo um ecossistema completo de mentorias, programas, imersões e experiências que iniciam, escalam e sustentam o crescimento das advogadas que decidiram construir um negócio jurídico com alma, lucro e autoridade.
              </p>
            </div>
            
            {/* Signature */}
            <div className="mt-8 pt-6 border-t border-cream/10">
              <p className="font-signature text-3xl text-secondary">
                Fabiana Duarte
              </p>
              <p className="text-sm text-cream/60 mt-1">
                Fundadora do Mentoring Club Soberana
              </p>
            </div>
          </motion.div>

          {/* Image with Golden Frame */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="order-1 lg:order-2"
          >
            <div className="relative">
              {/* Golden Frame */}
              <div className="golden-frame transition-all duration-500">
                {/* Decorative corners */}
                <div className="golden-corner golden-corner-tl" />
                <div className="golden-corner golden-corner-tr" />
                <div className="golden-corner golden-corner-bl" />
                <div className="golden-corner golden-corner-br" />
                
                <div className="golden-frame-inner">
                  <img
                    src={mentorSobre}
                    alt="Fabiana Duarte - Trajetória"
                    className="w-full aspect-[3/4] object-cover object-top"
                  />
                  {/* Golden vignette overlay */}
                  <div className="golden-vignette" />
                </div>
              </div>
              
              {/* Floating golden particles */}
              <div className="golden-particle absolute -top-3 -right-3 w-3 h-3" />
              <div className="golden-particle absolute -bottom-4 -left-4 w-2 h-2 animation-delay-300" />
              <div className="golden-particle absolute top-1/3 -left-2 w-2 h-2 animation-delay-500" />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
    </section>
  );
};
