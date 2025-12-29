import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { BeforeAfterSection } from "@/components/landing/BeforeAfterSection";
import { MentorSection } from "@/components/landing/MentorSection";
import MethodologySection from "@/components/landing/MethodologySection";
import { JornadaSoberanaSection } from "@/components/landing/JornadaSoberanaSection";
import { TrajetoriaSection } from "@/components/landing/TrajetoriaSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { DuvidaCTASection } from "@/components/landing/DuvidaCTASection";
import { LeadCaptureSection } from "@/components/landing/LeadCaptureSection";
import { Footer } from "@/components/landing/Footer";
import { WhatsAppButton } from "@/components/landing/WhatsAppButton";
import { ExitIntentPopup } from "@/components/landing/ExitIntentPopup";
import SEO, { createFAQSchema } from "@/components/SEO";
import { SplashScreen } from "@/components/SplashScreen";

const faqItems = [
  { question: "Qual programa é ideal para quem está começando?", answer: "Se você está começando, recomendo o Workshop Soberana IA ou o Experience Start." },
  { question: "Preciso ter experiência em marketing digital?", answer: "Não! A metodologia foi criada pensando em advogadas que são excelentes tecnicamente mas não dominam gestão e marketing." },
  { question: "Funciona para qualquer área do Direito?", answer: "Sim! A metodologia é sobre gestão de negócios jurídicos e funciona para advogadas de todas as áreas." },
];

const Index = () => {
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash on first visit (per session)
    const hasVisited = sessionStorage.getItem("soberana_visited");
    return !hasVisited;
  });

  useEffect(() => {
    if (!showSplash) return;
    sessionStorage.setItem("soberana_visited", "true");
  }, [showSplash]);

  // Handle anchor scroll when navigating from other pages
  useEffect(() => {
    if (location.hash) {
      // Small delay to ensure page is fully loaded
      setTimeout(() => {
        const element = document.querySelector(location.hash);
        element?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location.hash]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <main className="min-h-screen">
      <SEO 
        title="Soberana Mentoring Club - Mentoria para Advogadas Empresárias"
        description="Conduzo advogadas a transformarem técnica jurídica em faturamento real através de posicionamento premium, gestão empresarial, tráfego pago e inteligência artificial. Conheça nossos programas."
        keywords="mentoria jurídica, advogada empresária, carreira jurídica, advocacia feminina, gestão de escritório, tráfego pago para advogadas, IA jurídica"
        schema={createFAQSchema(faqItems)}
      />
      
      {showSplash && (
        <SplashScreen onComplete={handleSplashComplete} duration={2500} />
      )}
      
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <BeforeAfterSection />
      <MentorSection />
      <MethodologySection />
      <section id="jornada" className="scroll-mt-24">
        <JornadaSoberanaSection />
      </section>
      <section id="trajetoria" className="scroll-mt-24">
        <TrajetoriaSection />
      </section>
      <section id="depoimentos" className="scroll-mt-24">
        <TestimonialsSection />
      </section>
      <section id="faq" className="scroll-mt-24">
        <FAQSection />
      </section>
      <DuvidaCTASection />
      <LeadCaptureSection />
      <Footer />
      <WhatsAppButton />
      <ExitIntentPopup />
    </main>
  );
};

export default Index;
