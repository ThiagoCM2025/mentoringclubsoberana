import { useParams, Navigate } from "react-router-dom";
import { getProgramBySlug } from "@/data/programs";
import SEO from "@/components/SEO";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { WhatsAppButton } from "@/components/landing/WhatsAppButton";
import { ProgramHero } from "@/components/program/ProgramHero";
import { ProgramFeatures } from "@/components/program/ProgramFeatures";
import { ProgramTestimonials } from "@/components/program/ProgramTestimonials";
import { ProgramCTA } from "@/components/program/ProgramCTA";
import { ProgramFAQ } from "@/components/program/ProgramFAQ";

// Premium Components for Acceleration Program
import { AccelerationHero } from "@/components/program/AccelerationHero";
import { ProgramModulesTimeline } from "@/components/program/ProgramModulesTimeline";
import { ProgramContentPreview } from "@/components/program/ProgramContentPreview";

const ProgramDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const program = slug ? getProgramBySlug(slug) : undefined;

  if (!program) {
    return <Navigate to="/" replace />;
  }

  // Check if this is the Acceleration program for premium layout
  const isAccelerationProgram = slug === "aceleracao";

  return (
    <>
      <SEO
        title={`${program.title} | Soberana Mentoring Club`}
        description={program.description}
        keywords={`${program.title}, mentoria para advogadas, Fabiana Duarte, advocacia empresarial`}
      />
      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          {isAccelerationProgram ? (
            <>
              {/* Premium Acceleration Layout */}
              <AccelerationHero program={program} />
              <ProgramFeatures program={program} />
              <ProgramModulesTimeline program={program} />
              <ProgramTestimonials program={program} />
              <ProgramFAQ program={program} />
              <ProgramCTA program={program} />
            </>
          ) : (
            <>
              {/* Standard Program Layout */}
              <ProgramHero program={program} />
              <ProgramFeatures program={program} />
              <ProgramTestimonials program={program} />
              <ProgramFAQ program={program} />
              <ProgramCTA program={program} />
            </>
          )}
        </main>
        <Footer />
        <WhatsAppButton />
      </div>
    </>
  );
};

export default ProgramDetail;
