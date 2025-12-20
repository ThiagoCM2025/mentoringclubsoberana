import { useRef, useEffect, useState, useCallback } from "react";
import { PlayCircle, Pause, Play, Maximize, Minimize, Settings, PictureInPicture2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  url: string | null;
  onTimeUpdate?: (seconds: number) => void;
  onEnded?: () => void;
  initialTime?: number;
}

type VideoType = "youtube" | "vimeo" | "direct" | "none";

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const VideoPlayer = ({ url, onTimeUpdate, onEnded, initialTime = 0 }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [videoType, setVideoType] = useState<VideoType>("none");
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!url) {
      setVideoType("none");
      setEmbedUrl(null);
      return;
    }

    const { type, embed } = detectVideoType(url);
    setVideoType(type);
    setEmbedUrl(embed);

    if (type === "direct" && videoRef.current && initialTime > 0) {
      videoRef.current.currentTime = initialTime;
    }
  }, [url, initialTime]);

  // Keyboard shortcuts
  useEffect(() => {
    if (videoType !== "direct") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      // Don't trigger if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "arrowleft":
          e.preventDefault();
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
          break;
        case "arrowright":
          e.preventDefault();
          videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 10);
          break;
        case "arrowup":
          e.preventDefault();
          setVolume(prev => Math.min(1, prev + 0.1));
          break;
        case "arrowdown":
          e.preventDefault();
          setVolume(prev => Math.max(0, prev - 0.1));
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "p":
          if (e.shiftKey) {
            e.preventDefault();
            togglePiP();
          }
          break;
        case ",":
          e.preventDefault();
          const currentSpeedIndexDown = SPEED_OPTIONS.indexOf(playbackSpeed);
          if (currentSpeedIndexDown > 0) {
            setPlaybackSpeed(SPEED_OPTIONS[currentSpeedIndexDown - 1]);
          }
          break;
        case ".":
          e.preventDefault();
          const currentSpeedIndexUp = SPEED_OPTIONS.indexOf(playbackSpeed);
          if (currentSpeedIndexUp < SPEED_OPTIONS.length - 1) {
            setPlaybackSpeed(SPEED_OPTIONS[currentSpeedIndexUp + 1]);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [videoType, duration, playbackSpeed]);

  // Apply playback speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Apply volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const detectVideoType = (videoUrl: string): { type: VideoType; embed: string | null } => {
    const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = videoUrl.match(youtubeRegex);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      const startParam = initialTime > 0 ? `&start=${Math.floor(initialTime)}` : "";
      return {
        type: "youtube",
        embed: `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1${startParam}`
      };
    }

    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
    const vimeoMatch = videoUrl.match(vimeoRegex);
    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      return {
        type: "vimeo",
        embed: `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`
      };
    }

    if (videoUrl.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || videoUrl.includes("supabase")) {
      return {
        type: "direct",
        embed: videoUrl
      };
    }

    return {
      type: "direct",
      embed: videoUrl
    };
  };

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;
    
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiPActive(false);
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
        setIsPiPActive(true);
      }
    } catch (error) {
      console.error("PiP error:", error);
    }
  }, []);

  const handleTimeUpdateInternal = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    
    const currentSec = Math.floor(videoRef.current.currentTime);
    if (currentSec > 0 && currentSec % 10 === 0 && onTimeUpdate) {
      onTimeUpdate(currentSec);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (onEnded) onEnded();
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      if (initialTime > 0) {
        videoRef.current.currentTime = initialTime;
      }
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  // Listen for YouTube/Vimeo postMessage events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin === "https://www.youtube.com") {
        try {
          const data = JSON.parse(event.data);
          if (data.event === "onStateChange" && data.info === 0) {
            if (onEnded) onEnded();
          }
        } catch (e) {}
      }
      
      if (event.origin === "https://player.vimeo.com") {
        try {
          const data = JSON.parse(event.data);
          if (data.event === "finish") {
            if (onEnded) onEnded();
          }
        } catch (e) {}
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onEnded]);

  // Listen for PiP events
  useEffect(() => {
    const handlePiPChange = () => {
      setIsPiPActive(!!document.pictureInPictureElement);
    };

    videoRef.current?.addEventListener("enterpictureinpicture", handlePiPChange);
    videoRef.current?.addEventListener("leavepictureinpicture", handlePiPChange);

    return () => {
      videoRef.current?.removeEventListener("enterpictureinpicture", handlePiPChange);
      videoRef.current?.removeEventListener("leavepictureinpicture", handlePiPChange);
    };
  }, []);

  if (videoType === "none" || !url) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-muted">
        <PlayCircle className="w-20 h-20 mb-4" />
        <p>Vídeo em breve</p>
      </div>
    );
  }

  if (videoType === "youtube" || videoType === "vimeo") {
    return (
      <div className="relative w-full h-full">
        <iframe
          ref={iframeRef}
          src={embedUrl || ""}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          title="Video player"
        />
        {/* Speed control hint for embedded videos */}
        <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-muted-foreground">
          Use os controles do player para ajustar velocidade
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black group"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={embedUrl || ""}
        className="w-full h-full cursor-pointer"
        onTimeUpdate={handleTimeUpdateInternal}
        onEnded={handleVideoEnded}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onClick={togglePlay}
        playsInline
      />

      {/* Play overlay for paused state */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          onClick={togglePlay}
        >
          <div className="w-20 h-20 rounded-full bg-secondary/90 flex items-center justify-center shadow-2xl transition-transform hover:scale-110">
            <Play className="w-10 h-10 text-secondary-foreground ml-1" />
          </div>
        </div>
      )}

      {/* Custom Controls */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress bar */}
        <div className="mb-3">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-muted-foreground/30 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:bg-secondary [&>span:first-child_>span]:bg-secondary"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Left controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:bg-white/20 h-9 w-9"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </Button>

            {/* Volume */}
            <div className="flex items-center gap-1 group/volume">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:bg-white/20 h-9 w-9"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-200">
                <Slider
                  value={[isMuted ? 0 : volume]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={(v) => { setVolume(v[0]); setIsMuted(false); }}
                  className="cursor-pointer [&>span:first-child]:h-1 [&>span:first-child]:bg-white/30 [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:bg-white [&>span:first-child_>span]:bg-white"
                />
              </div>
            </div>

            {/* Time */}
            <span className="text-white text-sm font-mono ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1">
            {/* Speed control */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 font-mono text-sm h-9 px-2"
                >
                  {playbackSpeed}x
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700">
                {SPEED_OPTIONS.map((speed) => (
                  <DropdownMenuItem
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={cn(
                      "cursor-pointer text-white hover:bg-white/10",
                      playbackSpeed === speed && "bg-secondary/20 text-secondary"
                    )}
                  >
                    {speed}x {speed === 1 && "(Normal)"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* PiP */}
            {document.pictureInPictureEnabled && (
              <Button
                variant="ghost"
                size="icon"
                onClick={togglePiP}
                className={cn(
                  "text-white hover:bg-white/20 h-9 w-9",
                  isPiPActive && "bg-secondary/30 text-secondary"
                )}
                title="Picture-in-Picture (Shift+P)"
              >
                <PictureInPicture2 className="w-5 h-5" />
              </Button>
            )}

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20 h-9 w-9"
              title="Tela cheia (F)"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Speed indicator toast */}
      {playbackSpeed !== 1 && (
        <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-sm font-mono">
          {playbackSpeed}x
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
