import { useState, useRef } from "react";
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
  FileText,
  Image as ImageIcon,
  Loader2
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
  
  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Apenas imagens são permitidas (JPG, PNG, GIF, etc.)");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande. Máximo 5MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !user) return null;

    setUploadingImage(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/${mission?.id}-${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('mission-proofs')
        .upload(fileName, imageFile);

      if (error) {
        console.error("Upload error:", error);
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from('mission-proofs')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Erro ao enviar imagem");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async () => {
    if (!mission || !user) return;

    if (!content.trim()) {
      toast.error("Descreva o que você fez para completar a missão");
      return;
    }

    setSubmitting(true);

    try {
      // Upload image if selected
      let imageUrl: string | null = null;
      if (imageFile) {
        imageUrl = await uploadImage();
        if (imageFile && !imageUrl) {
          // Upload failed, don't proceed
          setSubmitting(false);
          return;
        }
      }

      const filteredLinks = links.filter(l => l.trim() !== "");

      const submissionData = {
        proof_content: content.trim(),
        proof_links: filteredLinks.length > 0 ? filteredLinks : null,
        proof_file_url: imageUrl,
        status: 'submitted' as const,
        submitted_at: new Date().toISOString(),
        reviewed_at: null,
        reviewed_by: null,
        admin_feedback: null,
        xp_earned: 0
      };

      // Check if this is a resubmission by querying for existing completion
      const { data: existingCompletion } = await supabase
        .from("user_mission_completions")
        .select("id")
        .eq("user_id", user.id)
        .eq("mission_id", mission.id)
        .maybeSingle();

      if (existingCompletion) {
        // Resubmission - use UPDATE
        const { error } = await supabase
          .from("user_mission_completions")
          .update(submissionData)
          .eq("user_id", user.id)
          .eq("mission_id", mission.id);

        if (error) throw error;
      } else {
        // First submission - use INSERT
        const { error } = await supabase
          .from("user_mission_completions")
          .insert({
            user_id: user.id,
            mission_id: mission.id,
            ...submissionData
          });

        if (error) throw error;
      }

      setSubmitted(true);
      
      // Reset after animation
      setTimeout(() => {
        resetForm();
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

  const resetForm = () => {
    setContent("");
    setLinks([""]);
    setSubmitted(false);
    handleRemoveImage();
  };

  const handleClose = () => {
    if (!submitting && !uploadingImage) {
      resetForm();
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
                  Descreva o que você fez para completar esta missão e adicione provas (imagem ou links)
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

                {/* Image Upload */}
                <div className="space-y-2">
                  <Label className="text-cream flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-secondary" />
                    Imagem de prova (opcional)
                  </Label>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="mission-image-upload"
                  />
                  
                  {imagePreview ? (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-40 object-cover rounded-lg border border-secondary/20"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-24 border-dashed border-secondary/30 bg-zinc-800/50 hover:bg-zinc-800 hover:border-secondary/50 text-cream/60"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-6 h-6 text-secondary" />
                        <span className="text-sm">Clique para enviar uma imagem</span>
                        <span className="text-xs text-cream/40">PNG, JPG até 5MB</span>
                      </div>
                    </Button>
                  )}
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
                  disabled={submitting || uploadingImage || !content.trim()}
                  className="w-full bg-secondary hover:bg-secondary/90 text-black font-semibold"
                >
                  {submitting || uploadingImage ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {uploadingImage ? "Enviando imagem..." : "Enviando..."}
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