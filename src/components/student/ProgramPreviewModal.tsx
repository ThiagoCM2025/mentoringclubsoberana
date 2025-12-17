import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Program } from "@/data/programs";
import { motion } from "framer-motion";
import { 
  Check, 
  Gift, 
  Clock, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  MessageCircle,
  Quote
} from "lucide-react";

interface ProgramPreviewModalProps {
  program: Program | null;
  isOpen: boolean;
  onClose: () => void;
}

const tierLabels: Record<string, string> = {
  entry: "Entrada",
  mid: "Premium",
  elite: "Elite"
};

const tierColors: Record<string, string> = {
  entry: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  mid: "bg-secondary/20 text-secondary border-secondary/30",
  elite: "bg-purple-500/20 text-purple-400 border-purple-500/30"
};

export const ProgramPreviewModal = ({ program, isOpen, onClose }: ProgramPreviewModalProps) => {
  if (!program) return null;

  const IconComponent = program.icon;

  const handleCTA = () => {
    if (program.ctaLink) {
      window.open(program.ctaLink, '_blank');
    } else {
      window.location.href = `/programa/${program.slug}`;
    }
  };

  const handleSecondaryCTA = () => {
    if (program.secondaryCta?.link) {
      window.open(program.secondaryCta.link, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 bg-zinc-950 border-secondary/20 overflow-hidden">
        <ScrollArea className="max-h-[85vh]">
          <div className="relative">
            {/* Hero Image */}
            <div className="relative aspect-video w-full overflow-hidden">
              {program.image && (
                <img 
                  src={program.image} 
                  alt={program.title}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
              
              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-secondary/60"
                    initial={{ 
                      x: `${Math.random() * 100}%`, 
                      y: "100%", 
                      opacity: 0 
                    }}
                    animate={{ 
                      y: "-10%", 
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 3
                    }}
                  />
                ))}
              </div>
              
              {/* Tier Badge */}
              <Badge 
                className={`absolute top-4 left-4 ${tierColors[program.tier]} border backdrop-blur-sm`}
              >
                {tierLabels[program.tier]}
              </Badge>
              
              {/* Icon */}
              <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-zinc-900/80 backdrop-blur-sm border border-secondary/20">
                <IconComponent className="w-6 h-6 text-secondary" />
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Title Section */}
              <div className="space-y-2">
                <h2 className="font-serif text-2xl md:text-3xl text-cream">
                  {program.subtitle}
                </h2>
                {program.impactPhrase && (
                  <p className="text-secondary font-medium text-lg">
                    {program.impactPhrase}
                  </p>
                )}
                <p className="text-cream/70 leading-relaxed">
                  {program.fullDescription || program.description}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {program.format && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/50 border border-secondary/10">
                    <Clock className="w-5 h-5 text-secondary" />
                    <div>
                      <p className="text-cream/50 text-xs uppercase tracking-wider">Formato</p>
                      <p className="text-cream font-medium">{program.format}</p>
                    </div>
                  </div>
                )}
                {program.duration && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/50 border border-secondary/10">
                    <Calendar className="w-5 h-5 text-secondary" />
                    <div>
                      <p className="text-cream/50 text-xs uppercase tracking-wider">Duração</p>
                      <p className="text-cream font-medium">{program.duration}</p>
                    </div>
                  </div>
                )}
                {program.location && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-zinc-900/50 border border-secondary/10">
                    <MapPin className="w-5 h-5 text-secondary" />
                    <div>
                      <p className="text-cream/50 text-xs uppercase tracking-wider">Local</p>
                      <p className="text-cream font-medium">{program.location}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Target Audience */}
              {program.targetAudience && program.targetAudience.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-cream font-semibold flex items-center gap-2">
                    <div className="w-1 h-5 bg-secondary rounded-full" />
                    Para quem é
                  </h3>
                  <ul className="space-y-2">
                    {program.targetAudience.map((item, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 text-cream/70"
                      >
                        <Check className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Deliverables */}
              {program.deliverables && program.deliverables.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-cream font-semibold flex items-center gap-2">
                    <div className="w-1 h-5 bg-secondary rounded-full" />
                    O que você recebe
                  </h3>
                  <ul className="space-y-2">
                    {program.deliverables.map((item, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 text-cream/70"
                      >
                        <Gift className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Testimonials */}
              {program.testimonials && program.testimonials.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-cream font-semibold flex items-center gap-2">
                    <div className="w-1 h-5 bg-secondary rounded-full" />
                    Depoimentos
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {program.testimonials.slice(0, 2).map((testimonial, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.15 }}
                        className="relative p-4 rounded-xl bg-zinc-900/50 border border-secondary/10"
                      >
                        <Quote className="absolute top-3 right-3 w-6 h-6 text-secondary/20" />
                        <p className="text-cream/70 text-sm italic mb-3 line-clamp-4">
                          "{testimonial.content}"
                        </p>
                        <div>
                          <p className="text-cream font-medium text-sm">{testimonial.name}</p>
                          <p className="text-cream/50 text-xs">{testimonial.area}</p>
                          {testimonial.result && (
                            <p className="text-secondary text-xs mt-1 font-medium">{testimonial.result}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ */}
              {program.faq && program.faq.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-cream font-semibold flex items-center gap-2">
                    <div className="w-1 h-5 bg-secondary rounded-full" />
                    Perguntas Frequentes
                  </h3>
                  <Accordion type="single" collapsible className="space-y-2">
                    {program.faq.slice(0, 3).map((item, index) => (
                      <AccordionItem 
                        key={index} 
                        value={`faq-${index}`}
                        className="border border-secondary/10 rounded-xl px-4 bg-zinc-900/30"
                      >
                        <AccordionTrigger className="text-cream hover:text-secondary text-left text-sm">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-cream/70 text-sm">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}

              {/* Footer CTA */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-secondary/20">
                <div>
                  {program.price ? (
                    <span className="text-2xl font-bold text-secondary">{program.price}</span>
                  ) : (
                    <span className="text-cream/50">Consulte valores</span>
                  )}
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                  {program.secondaryCta && (
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-none border-secondary/30 text-cream hover:bg-secondary/10"
                      onClick={handleSecondaryCTA}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {program.secondaryCta.text}
                    </Button>
                  )}
                  <Button 
                    className="flex-1 sm:flex-none bg-secondary text-black hover:bg-secondary-light font-semibold"
                    onClick={handleCTA}
                  >
                    {program.ctaText || "Quero participar"}
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
