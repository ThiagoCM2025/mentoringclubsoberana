import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Trash2, Send, X, Loader2, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VoiceRecorderProps {
  conversationId: string;
  phone: string;
  onMessageSent: () => void;
  disabled?: boolean;
}

// Reduced to 8 bars for compact mobile display
const WAVEFORM_BARS = 8;

export function VoiceRecorder({
  conversationId,
  phone,
  onMessageSent,
  disabled,
}: VoiceRecorderProps) {
  const {
    isRecording,
    duration,
    audioBlob,
    isSupported,
    audioData,
    startRecording,
    stopRecording,
    cancelRecording,
    clearAudio,
  } = useVoiceRecorder();

  const [isSending, setIsSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Process audio data for waveform visualization - compact 8 bars
  const waveformBars = useMemo(() => {
    if (!audioData || audioData.length === 0) {
      return Array(WAVEFORM_BARS).fill(4);
    }
    
    const step = Math.floor(audioData.length / WAVEFORM_BARS);
    const bars: number[] = [];
    
    for (let i = 0; i < WAVEFORM_BARS; i++) {
      const index = Math.min(i * step, audioData.length - 1);
      // Normalize value from 0-255 to 4-20 (compact height range)
      const normalized = Math.max(4, Math.floor((audioData[index] / 255) * 20));
      bars.push(normalized);
    }
    
    return bars;
  }, [audioData]);

  // When we have an audio blob, show preview
  useEffect(() => {
    if (audioBlob && !isRecording) {
      setShowPreview(true);
    }
  }, [audioBlob, isRecording]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRecording = async () => {
    const success = await startRecording();
    if (!success) {
      toast.error("Não foi possível acessar o microfone");
    }
  };

  const handleStopAndSend = async () => {
    stopRecording();
  };

  const handleSendAudio = async () => {
    if (!audioBlob) return;

    setIsSending(true);
    try {
      const filename = `voice-${Date.now()}.webm`;
      const filePath = `${conversationId}/${filename}`;
      
      const { error: uploadError } = await supabase.storage
        .from("whatsapp-media")
        .upload(filePath, audioBlob, {
          contentType: audioBlob.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("whatsapp-media")
        .getPublicUrl(filePath);

      const mediaUrl = urlData.publicUrl;

      const { error: sendError } = await supabase.functions.invoke("send-whatsapp-media", {
        body: {
          phone,
          mediaUrl,
          mediaType: "audio",
          conversationId,
        },
      });

      if (sendError) throw sendError;

      toast.success("Áudio enviado!");
      clearAudio();
      setShowPreview(false);
      onMessageSent();
    } catch (error) {
      console.error("Error sending voice message:", error);
      toast.error("Erro ao enviar áudio");
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
        // Recording state - compact design for mobile
        <motion.div
          key="recording"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-1.5 bg-red-500/10 rounded-full px-2 py-1"
        >
          {/* Cancel button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-red-500/20"
            onClick={handleCancel}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
          
          {/* Recording indicator + duration */}
          <div className="flex items-center gap-1.5 px-1">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-2 h-2 bg-red-500 rounded-full"
            />
            <span className="text-xs font-medium text-red-600 dark:text-red-400 min-w-[28px]">
              {formatDuration(duration)}
            </span>
          </div>
          
          {/* Compact waveform visualization */}
          <div className="flex items-center justify-center gap-[2px] h-5">
            {waveformBars.map((height, i) => (
              <motion.div
                key={i}
                className="w-[3px] bg-red-500 rounded-full"
                animate={{ height }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 25,
                }}
                style={{ minHeight: 4 }}
              />
            ))}
          </div>
          
          {/* Stop button */}
          <Button
            type="button"
            size="icon"
            className="h-8 w-8 bg-red-500 hover:bg-red-600 rounded-full text-white"
            onClick={handleStopAndSend}
          >
            <Square className="h-3 w-3 fill-current" />
          </Button>
        </motion.div>
      ) : showPreview && audioBlob ? (
        // Preview state - compact
        <motion.div
          key="preview"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="flex items-center gap-1.5 bg-muted/80 rounded-full px-2 py-1"
        >
          {/* Delete button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-red-500/20"
            onClick={handleCancel}
            disabled={isSending}
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </Button>
          
          {/* Duration */}
          <div className="flex items-center gap-1.5 px-1">
            <Mic className="h-3.5 w-3.5 text-[#25D366]" />
            <span className="text-xs font-medium text-muted-foreground">
              {formatDuration(duration)}
            </span>
          </div>
          
          {/* Send button */}
          <Button
            type="button"
            size="icon"
            className="h-8 w-8 bg-[#25D366] hover:bg-[#128C7E] rounded-full text-white"
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
        // Idle state - mic button
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
              "h-10 w-10 rounded-full transition-all touch-target",
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
