import { useState, useRef, useEffect } from "react";
import { Play, Pause, Mic } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  audioUrl: string;
  isOutgoing: boolean;
}

export function AudioPlayer({ audioUrl, isOutgoing }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const newTime = (value[0] / 100) * duration;
    audio.currentTime = newTime;
    setProgress(value[0]);
    setCurrentTime(newTime);
  };

  const cyclePlaybackRate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const rates = [1, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    audio.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-2xl min-w-[200px] max-w-[280px]",
        isOutgoing
          ? "bg-[#d9fdd3] dark:bg-[#005c4b]"
          : "bg-white dark:bg-zinc-800 border border-border"
      )}
    >
      {/* Avatar/Mic icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center",
          isOutgoing
            ? "bg-[#00a884]/20"
            : "bg-muted"
        )}
      >
        <Mic className={cn(
          "w-5 h-5",
          isOutgoing ? "text-[#00a884]" : "text-muted-foreground"
        )} />
      </div>

      {/* Play/Pause button */}
      <button
        onClick={togglePlay}
        className="flex-shrink-0 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        disabled={!isLoaded}
      >
        {isPlaying ? (
          <Pause
            className={cn(
              "w-7 h-7",
              isOutgoing ? "text-[#00a884]" : "text-primary"
            )}
            fill="currentColor"
          />
        ) : (
          <Play
            className={cn(
              "w-7 h-7 ml-0.5",
              isOutgoing ? "text-[#00a884]" : "text-primary"
            )}
            fill="currentColor"
          />
        )}
      </button>

      {/* Progress section */}
      <div className="flex-1 min-w-0 space-y-0.5">
        {/* Progress bar */}
        <Slider
          value={[progress]}
          max={100}
          step={0.1}
          onValueChange={handleSeek}
          className={cn(
            "cursor-pointer",
            "[&_[role=slider]]:h-3 [&_[role=slider]]:w-3",
            "[&_[role=slider]]:border-0",
            isOutgoing
              ? "[&_[role=slider]]:bg-[#00a884] [&_.relative>div]:bg-[#00a884]"
              : "[&_[role=slider]]:bg-primary [&_.relative>div]:bg-primary"
          )}
          disabled={!isLoaded}
        />

        {/* Time display */}
        <div className="flex justify-between text-[10px] text-muted-foreground px-0.5">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback rate */}
      <button
        onClick={cyclePlaybackRate}
        className={cn(
          "text-[10px] font-semibold px-1.5 py-0.5 rounded-full transition-colors",
          isOutgoing
            ? "text-[#00a884] bg-[#00a884]/15 hover:bg-[#00a884]/25"
            : "text-primary bg-primary/10 hover:bg-primary/20"
        )}
      >
        {playbackRate}x
      </button>

      <audio ref={audioRef} src={audioUrl} preload="metadata" />
    </div>
  );
}
