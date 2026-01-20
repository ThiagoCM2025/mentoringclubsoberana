import { useCallback, useRef, useState, useEffect } from "react";

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";

export function useWhatsAppSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(() => {
    const stored = localStorage.getItem("whatsapp-sound-enabled");
    return stored !== "false";
  });

  useEffect(() => {
    // Pre-load the audio
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.5;
    audioRef.current.preload = "auto";
  }, []);

  useEffect(() => {
    localStorage.setItem("whatsapp-sound-enabled", String(enabled));
  }, [enabled]);

  const playNotification = useCallback(() => {
    if (!enabled) return;
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Silently fail if autoplay is blocked
      });
    }
  }, [enabled]);

  const toggleSound = useCallback(() => {
    setEnabled((prev) => !prev);
  }, []);

  return { 
    playNotification, 
    soundEnabled: enabled, 
    toggleSound 
  };
}
