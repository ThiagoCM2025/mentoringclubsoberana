import { motion } from "framer-motion";
import { AlertCircle, Target, TrendingUp } from "lucide-react";

export const JornadaProblemSection = () => {
  return (
    <section className="relative py-10 md:py-16 bg-zinc-900 overflow-hidden">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url('/assets/brand/pattern-circles-gold.png')`,
          backgroundSize: '150px',
        }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-black via-transparent to-brand-black" />
      
      <div className="container-soberana relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-6 md:mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary-foreground border border-primary/30 px-4 py-2 rounded-full mb-6">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">O PROBLEMA & A PROMESSA</span>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Problem */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-primary to-transparent rounded-full hidden md:block" />
              
              <h3 className="font-serif text-2xl md:text-3xl text-cream mb-4">
                Janeiro é o mês de <span className="text-primary">planejar</span>...
              </h3>
              
              <div className="space-y-4 text-cream/80">
                <p>
                  Mas para uma advogada do imobiliário, <strong className="text-cream">o tempo é o recurso mais escasso</strong>.
                </p>
                <p>
                  Você quer escalar seu escritório, mas se sente presa na operação?
                </p>
                <p>
                  Quer clientes melhores, mas ainda vive de indicações instáveis?
                </p>
              </div>
            </motion.div>

            {/* Promise */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="relative"
            >
              <div className="p-6 md:p-8 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <Target className="w-5 h-5 text-secondary" />
                  </div>
                  <h3 className="font-serif text-xl text-secondary">A Solução</h3>
                </div>
                
                <p className="text-cream/90 mb-4">
                  Eu preparei uma <strong className="text-cream">agenda estratégica</strong> para você tirar as metas do papel e colocar a mão na massa.
                </p>
                
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                  <TrendingUp className="w-5 h-5 text-secondary flex-shrink-0" />
                  <p className="text-cream text-sm font-medium">
                    5 encontros práticos, direto ao ponto, para transformar sua advocacia este ano.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
