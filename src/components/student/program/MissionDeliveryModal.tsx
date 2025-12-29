import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { 
  Send, 
  Link as LinkIcon, 
  Plus, 
  X, 
  CheckCircle2,
  Upload,
  FileText
} from "lucide-react";
import { WeeklyMission } from "./WeeklyMissionCard";

interface MissionDeliveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mission: WeeklyMission | null;
  onSuccess: () => void;
}

export const MissionDeliveryModal = ({
  open,
  onOpenChange,
  mission,
  onSuccess
}: MissionDeliveryModalProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [links, setLinks] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleAddLink = () => {
    if (links.length < 5) {
      setLinks([...links, ""]);
    }
  };

  const handleRemoveLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const handleSubmit = async () => {
    if (!mission || !user) return;

    if (!content.trim()) {
      toast.error("Descreva o que você fez para completar a missão");
      return;
    }

    setSubmitting(true);

    try {
      const filteredLinks = links.filter(l => l.trim() !== "");

      const { error } = await supabase
        .from("user_mission_completions")
        .upsert({
          user_id: user.id,
          mission_id: mission.id,
          proof_content: content.trim(),
          proof_links: filteredLinks.length > 0 ? filteredLinks : null,
          status: 'submitted',
          submitted_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,mission_id'
        });

      if (error) throw error;

      setSubmitted(true);
      
      // Reset after animation
      setTimeout(() => {
        setContent("");
        setLinks([""]);
        setSubmitted(false);
        onOpenChange(false);
        onSuccess();
        toast.success("Missão entregue com sucesso! Aguarde a aprovação.");
      }, 1500);
    } catch (error) {
      console.error("Error submitting mission:", error);
      toast.error("Erro ao enviar missão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setContent("");
      setLinks([""]);
      setSubmitted(false);
      onOpenChange(false);
    }
  };

  if (!mission) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-zinc-900 border-secondary/20 max-w-lg">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </motion.div>
              <h3 className="text-xl font-serif font-bold text-cream mb-2">
                Missão Entregue!
              </h3>
              <p className="text-cream/60">
                Aguarde a aprovação da mentora
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center text-2xl">
                    {mission.gamification_emoji}
                  </div>
                  <div>
                    <p className="text-xs text-secondary uppercase tracking-wider">
                      Semana {mission.week_number}
                    </p>
                    <DialogTitle className="text-cream font-serif">
                      {mission.title}
                    </DialogTitle>
                  </div>
                </div>
                <DialogDescription className="text-cream/60">
                  Descreva o que você fez para completar esta missão e adicione links de prova (prints, posts, etc.)
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 mt-6">
                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-cream flex items-center gap-2">
                    <FileText className="w-4 h-4 text-secondary" />
                    Descreva sua entrega
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Conta pra gente o que você fez, os resultados que obteve, aprendizados..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[120px] bg-zinc-800 border-secondary/20 text-cream placeholder:text-cream/40"
                  />
                </div>

                {/* Links */}
                <div className="space-y-2">
                  <Label className="text-cream flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-secondary" />
                    Links de prova (opcional)
                  </Label>
                  
                  <div className="space-y-2">
                    {links.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder="https://..."
                          value={link}
                          onChange={(e) => handleLinkChange(index, e.target.value)}
                          className="bg-zinc-800 border-secondary/20 text-cream placeholder:text-cream/40"
                        />
                        {links.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveLink(index)}
                            className="text-cream/50 hover:text-red-400"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {links.length < 5 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAddLink}
                      className="text-secondary hover:text-secondary/80"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Adicionar link
                    </Button>
                  )}
                </div>

                {/* Reward preview */}
                <div className="bg-secondary/10 rounded-xl p-4 border border-secondary/20">
                  <p className="text-sm text-cream/60 mb-1">Ao ter sua missão aprovada, você ganha:</p>
                  <p className="font-semibold text-secondary">
                    🏆 {mission.xp_reward} XP + {mission.gamification_title}
                  </p>
                </div>

                {/* Submit button */}
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !content.trim()}
                  className="w-full bg-secondary hover:bg-secondary/90 text-black font-semibold"
                >
                  {submitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full mr-2"
                      />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Entrega
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};
