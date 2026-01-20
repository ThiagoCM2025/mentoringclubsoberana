import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Trash2, Send, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  conversationId: string;
  phone: string;
  onMessageSent: () => void;
  disabled?: boolean;
}

export function VoiceRecorder({
  conversationId,
  phone,
  onMessageSent,
  disabled,
}: VoiceRecorderProps) {
  const { toast } = useToast();
  const {
    isRecording,
    duration,
    audioBlob,
    isSupported,
    startRecording,
    stopRecording,
    cancelRecording,
    clearAudio,
  } = useVoiceRecorder();

  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // When we have an audio blob, show preview
  useEffect(() => {
    if (audioBlob && !isRecording) {
      setShowPreview(true);
    }
  }, [audioBlob, isRecording]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRecording = async () => {
    const success = await startRecording();
    if (!success) {
      toast({
        title: "Erro ao gravar",
        description: "Não foi possível acessar o microfone. Verifique as permissões.",
        variant: "destructive",
      });
    }
  };

  const handleStopAndSend = async () => {
    stopRecording();
  };

  const handleSendAudio = async () => {
    if (!audioBlob) return;

    setIsSending(true);
    try {
      // Upload to Supabase Storage
      const filename = `voice-${Date.now()}.webm`;
      const filePath = `${conversationId}/${filename}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("whatsapp-media")
        .upload(filePath, audioBlob, {
          contentType: audioBlob.type,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("whatsapp-media")
        .getPublicUrl(filePath);

      const mediaUrl = urlData.publicUrl;

      // Send via Edge Function
      const { data: session } = await supabase.auth.getSession();
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-whatsapp-media`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.session?.access_token}`,
          },
          body: JSON.stringify({
            phone,
            mediaUrl,
            mediaType: "audio",
            conversationId,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Falha ao enviar áudio");
      }

      toast({
        title: "Áudio enviado!",
        description: "Sua mensagem de voz foi enviada com sucesso.",
      });

      clearAudio();
      setShowPreview(false);
      onMessageSent();
    } catch (error) {
      console.error("Error sending voice message:", error);
      toast({
        title: "Erro ao enviar",
        description: "Não foi possível enviar o áudio. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      cancelRecording();
    } else {
      clearAudio();
      setShowPreview(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {isRecording ? (
        <motion.div
          key="recording"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1.5"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-red-500/20"
            onClick={handleCancel}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
          
          <div className="flex items-center gap-2 min-w-[80px]">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-2 h-2 bg-red-500 rounded-full"
            />
            <span className="text-sm font-medium text-red-600">
              {formatDuration(duration)}
            </span>
          </div>
          
          {/* Waveform animation */}
          <div className="flex items-center gap-0.5 h-6">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-0.5 bg-red-500 rounded-full"
                animate={{
                  height: [8, 20, 8],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.5,
                  delay: i * 0.1,
                }}
              />
            ))}
          </div>
          
          <Button
            type="button"
            size="icon"
            className="h-8 w-8 bg-[#25D366] hover:bg-[#128C7E] rounded-full"
            onClick={handleStopAndSend}
          >
            <Send className="h-4 w-4" />
          </Button>
        </motion.div>
      ) : showPreview && audioBlob ? (
        <motion.div
          key="preview"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 rounded-full px-3 py-1.5"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-red-500/20"
            onClick={handleCancel}
            disabled={isSending}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
          
          <div className="flex items-center gap-2">
            <Mic className="h-4 w-4 text-[#25D366]" />
            <span className="text-sm font-medium text-[#25D366]">
              {formatDuration(duration)}
            </span>
          </div>
          
          <Button
            type="button"
            size="icon"
            className="h-8 w-8 bg-[#25D366] hover:bg-[#128C7E] rounded-full"
            onClick={handleSendAudio}
            disabled={isSending}
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="idle"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10 rounded-full transition-all",
              "hover:bg-[#25D366]/20 hover:text-[#25D366]"
            )}
            onClick={handleStartRecording}
            disabled={disabled}
          >
            <Mic className="h-5 w-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
