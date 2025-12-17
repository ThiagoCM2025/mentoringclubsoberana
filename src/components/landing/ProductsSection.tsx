import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Crown, BookOpen, Mic, Users, FileText, ArrowRight, Check } from "lucide-react";

const products = [
  {
    icon: Crown,
    title: "Mentoria Individual",
    subtitle: "Acompanhamento Premium",
    description: "Mentoria 1:1 com Fabiana Duarte para acelerar sua transformação com acompanhamento personalizado.",
    features: ["12 sessões individuais", "Acesso direto via WhatsApp", "Plano de ação personalizado", "Suporte prioritário"],
    highlight: true,
    cta: "Candidatar-se",
  },
  {
    icon: BookOpen,
    title: "Curso Soberana",
    subtitle: "Formação Completa",
    description: "Curso completo com todos os 7 pilares da metodologia S.O.B.E.R.A.N.A. em videoaulas.",
    features: ["40+ horas de conteúdo", "Materiais complementares", "Certificado de conclusão", "Comunidade exclusiva"],
    highlight: false,
    cta: "Saber Mais",
  },
  {
    icon: Mic,
    title: "Palestras",
    subtitle: "Eventos Corporativos",
    description: "Leve a metodologia Soberana para seu evento, escritório ou congresso jurídico.",
    features: ["Palestra customizada", "Material de apoio", "Q&A com participantes", "Certificados"],
    highlight: false,
    cta: "Solicitar Proposta",
  },
  {
    icon: Users,
    title: "Small Group",
    subtitle: "Mentoria em Grupo",
    description: "Mentorias em grupos reduzidos para networking e aprendizado colaborativo.",
    features: ["Grupos de até 10 pessoas", "6 encontros mensais", "Networking qualificado", "Preço acessível"],
    highlight: false,
    cta: "Entrar na Lista",
  },
  {
    icon: FileText,
    title: "E-books & Materiais",
    subtitle: "Conteúdo Gratuito",
    description: "Materiais gratuitos para você começar sua jornada de transformação.",
    features: ["E-books exclusivos", "Checklists práticos", "Planilhas de gestão", "Templates jurídicos"],
    highlight: false,
    cta: "Baixar Grátis",
  },
];

export const ProductsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const scrollToCapture = () => {
    document.getElementById("captura")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section ref={ref} className="section-padding bg-background">
      <div className="container-soberana">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="badge-gold mb-4">Nossas Soluções</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-foreground mb-6">
            Escolha o Caminho Ideal{" "}
            <span className="text-primary">Para Você</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Diferentes formatos para diferentes momentos da sua jornada. Encontre a solução que faz sentido para você.
          </p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative rounded-xl p-6 transition-all ${
                product.highlight
                  ? "bg-primary text-primary-foreground border-2 border-secondary shadow-elegant"
                  : "bg-card border border-border hover:border-secondary/30 hover:shadow-card"
              }`}
            >
              {product.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-secondary text-secondary-foreground text-sm font-medium rounded-full">
                  Mais Popular
                </div>
              )}

              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                product.highlight ? "bg-secondary/20" : "bg-primary/10"
              }`}>
                <product.icon className={`w-7 h-7 ${product.highlight ? "text-secondary" : "text-primary"}`} />
              </div>

              <h3 className="text-2xl font-serif font-bold mb-1">{product.title}</h3>
              <p className={`text-sm mb-3 ${product.highlight ? "text-secondary" : "text-secondary"}`}>
                {product.subtitle}
              </p>
              <p className={`mb-6 ${product.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {product.description}
              </p>

              <ul className="space-y-2 mb-6">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className={`w-4 h-4 ${product.highlight ? "text-secondary" : "text-secondary"}`} />
                    <span className={product.highlight ? "text-primary-foreground/90" : "text-muted-foreground"}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={scrollToCapture}
                variant={product.highlight ? "secondary" : "outline"}
                className={`w-full group ${
                  product.highlight
                    ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                    : "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                }`}
              >
                {product.cta}
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};