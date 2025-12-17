import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { BeforeAfterSection } from "@/components/landing/BeforeAfterSection";
import { MentorSection } from "@/components/landing/MentorSection";
import { MethodologySection } from "@/components/landing/MethodologySection";
import { JornadaSoberanaSection } from "@/components/landing/JornadaSoberanaSection";
import { TrajetoriaSection } from "@/components/landing/TrajetoriaSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { DuvidaCTASection } from "@/components/landing/DuvidaCTASection";
import { LeadCaptureSection } from "@/components/landing/LeadCaptureSection";
import { Footer } from "@/components/landing/Footer";
import { WhatsAppButton } from "@/components/landing/WhatsAppButton";
import SEO, { createFAQSchema } from "@/components/SEO";

const faqItems = [
  { question: "Qual programa é ideal para quem está começando?", answer: "Se você está começando, recomendo o Workshop Soberana IA ou o Experience Start." },
  { question: "Preciso ter experiência em marketing digital?", answer: "Não! A metodologia foi criada pensando em advogadas que são excelentes tecnicamente mas não dominam gestão e marketing." },
  { question: "Funciona para qualquer área do Direito?", answer: "Sim! A metodologia é sobre gestão de negócios jurídicos e funciona para advogadas de todas as áreas." },
];

const Index = () => {
  return (
    <main className="min-h-screen">
      <SEO 
        title="Soberana Mentoring Club - Mentoria para Advogadas Empresárias"
        description="Conduzo advogadas a transformarem técnica jurídica em faturamento real através de posicionamento premium, gestão empresarial, tráfego pago e inteligência artificial. Conheça nossos programas."
        keywords="mentoria jurídica, advogada empresária, carreira jurídica, advocacia feminina, gestão de escritório, tráfego pago para advogadas, IA jurídica"
        schema={createFAQSchema(faqItems)}
      />
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <BeforeAfterSection />
      <MentorSection />
      <MethodologySection />
      <section id="jornada">
        <JornadaSoberanaSection />
      </section>
      <section id="trajetoria">
        <TrajetoriaSection />
      </section>
      <section id="depoimentos">
        <TestimonialsSection />
      </section>
      <section id="faq">
        <FAQSection />
      </section>
      <DuvidaCTASection />
      <LeadCaptureSection />
      <Footer />
      <WhatsAppButton />
    </main>
  );
};

export default Index;
