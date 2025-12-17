import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { MentorSection } from "@/components/landing/MentorSection";
import { MethodologySection } from "@/components/landing/MethodologySection";
import { ProductsSection } from "@/components/landing/ProductsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { LeadCaptureSection } from "@/components/landing/LeadCaptureSection";
import { Footer } from "@/components/landing/Footer";
import SEO, { createFAQSchema } from "@/components/SEO";

const faqItems = [
  { question: "O que é o Soberana Mentoring Club?", answer: "É um programa de mentoria exclusivo para advogadas que desejam construir uma carreira jurídica de sucesso." },
  { question: "Para quem é indicado?", answer: "Para advogadas em qualquer estágio da carreira que buscam crescimento profissional e autonomia." },
  { question: "Como funciona a mentoria?", answer: "Através de aulas gravadas, encontros ao vivo e acompanhamento personalizado." },
];

const Index = () => {
  return (
    <main className="min-h-screen">
      <SEO 
        title="Soberana Mentoring Club - Transforme sua Carreira Jurídica"
        description="Programa de mentoria exclusivo para advogadas que desejam construir uma carreira jurídica de sucesso, com autonomia e excelência. Mais de 500 advogadas transformadas."
        keywords="mentoria jurídica, advogada, carreira jurídica, advocacia feminina, desenvolvimento profissional, curso para advogadas"
        schema={createFAQSchema(faqItems)}
      />
      <Navbar />
      <HeroSection />
      <section id="sobre">
        <ProblemSection />
        <MentorSection />
      </section>
      <section id="metodologia">
        <MethodologySection />
      </section>
      <section id="produtos">
        <ProductsSection />
      </section>
      <section id="depoimentos">
        <TestimonialsSection />
      </section>
      <section id="faq">
        <FAQSection />
      </section>
      <LeadCaptureSection />
      <Footer />
    </main>
  );
};

export default Index;