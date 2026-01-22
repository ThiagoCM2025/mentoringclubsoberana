import { useCallback, useRef, useState, useEffect } from "react";

const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3";

export function useWhatsAppSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(() => {
    // Usar a mesma chave do AdminNotificationBell para consistência
    const stored = localStorage.getItem("admin_notification_sound");
    return stored !== "false";
  });

  useEffect(() => {
    // Pre-load the audio
    audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
    audioRef.current.volume = 0.5;
    audioRef.current.preload = "auto";
  }, []);

  // Desbloquear áudio com primeira interação do usuário
  useEffect(() => {
    const unlockAudio = () => {
      if (audioRef.current) {
        const audio = audioRef.current;
        audio.volume = 0;
        audio.play().then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = 0.5;
        }).catch(() => {});
      }
      document.removeEventListener('click', unlockAudio);
    };
    
    document.addEventListener('click', unlockAudio, { once: true });
    return () => document.removeEventListener('click', unlockAudio);
  }, []);

  useEffect(() => {
    localStorage.setItem("admin_notification_sound", String(enabled));
  }, [enabled]);

  const playNotification = useCallback(() => {
    if (!enabled) return;
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((error) => {
        console.warn("Autoplay bloqueado pelo navegador:", error.message);
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
