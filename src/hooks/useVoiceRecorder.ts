import { useState, useRef, useCallback, useEffect } from "react";

interface UseVoiceRecorderReturn {
  isRecording: boolean;
  duration: number;
  audioBlob: Blob | null;
  isSupported: boolean;
  audioData: Uint8Array | null;
  startRecording: () => Promise<boolean>;
  stopRecording: () => void;
  cancelRecording: () => void;
  clearAudio: () => void;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<number | null>(null);
  
  // Web Audio API refs for waveform
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Check if browser supports getUserMedia
    setIsSupported(
      typeof navigator !== "undefined" &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function"
    );
  }, []);

  const updateWaveform = useCallback(() => {
    if (!analyserRef.current) return;
    
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    setAudioData(dataArray);
    
    animationFrameRef.current = requestAnimationFrame(updateWaveform);
  }, []);

  const startRecording = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.error("MediaDevices API not supported");
      return false;
    }

    try {
      chunksRef.current = [];
      setAudioBlob(null);
      setDuration(0);
      setAudioData(null);

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      
      // Setup Web Audio API for waveform visualization
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64; // 32 frequency bins
      analyser.smoothingTimeConstant = 0.5;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Start waveform animation
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
      
      // Try to use webm with opus, fallback to other formats
      let mimeType = "audio/webm;codecs=opus";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "audio/webm";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "audio/mp4";
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = "audio/ogg";
          }
        }
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        // Clear interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        
        // Cleanup audio context
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
          audioContextRef.current = null;
        }
        analyserRef.current = null;
        setAudioData(null);
      };

      mediaRecorder.onerror = (event) => {
        console.error("MediaRecorder error:", event);
        cancelRecording();
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);

      // Start duration timer
      const startTime = Date.now();
      intervalRef.current = window.setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      return true;
    } catch (error) {
      console.error("Error starting recording:", error);
      return false;
    }
  }, [isSupported, updateWaveform]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const cancelRecording = useCallback(() => {
    // Stop the recorder without saving
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    
    // Stop all tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Clear interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Cleanup audio context
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    
    // Reset state
    chunksRef.current = [];
    setAudioBlob(null);
    setDuration(0);
    setIsRecording(false);
    setAudioData(null);
  }, []);

  const clearAudio = useCallback(() => {
    setAudioBlob(null);
    setDuration(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isRecording,
    duration,
    audioBlob,
    isSupported,
    audioData,
    startRecording,
    stopRecording,
    cancelRecording,
    clearAudio,
  };
}
