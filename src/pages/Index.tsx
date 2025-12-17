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

const Index = () => {
  return (
    <main className="min-h-screen">
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