import { useRef, useEffect, useState } from "react";
import { PlayCircle } from "lucide-react";

interface VideoPlayerProps {
  url: string | null;
  onTimeUpdate?: (seconds: number) => void;
  onEnded?: () => void;
  initialTime?: number;
}

type VideoType = "youtube" | "vimeo" | "direct" | "none";

const VideoPlayer = ({ url, onTimeUpdate, onEnded, initialTime = 0 }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [videoType, setVideoType] = useState<VideoType>("none");
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setVideoType("none");
      setEmbedUrl(null);
      return;
    }

    // Detect video type and create embed URL
    const { type, embed } = detectVideoType(url);
    setVideoType(type);
    setEmbedUrl(embed);

    // Set initial time for direct videos
    if (type === "direct" && videoRef.current && initialTime > 0) {
      videoRef.current.currentTime = initialTime;
    }
  }, [url, initialTime]);

  const detectVideoType = (videoUrl: string): { type: VideoType; embed: string | null } => {
    // YouTube detection
    const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = videoUrl.match(youtubeRegex);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      // Add enablejsapi for YouTube API communication
      const startParam = initialTime > 0 ? `&start=${Math.floor(initialTime)}` : "";
      return {
        type: "youtube",
        embed: `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1${startParam}`
      };
    }

    // Vimeo detection
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)/;
    const vimeoMatch = videoUrl.match(vimeoRegex);
    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      return {
        type: "vimeo",
        embed: `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`
      };
    }

    // Direct video URL (mp4, webm, etc.)
    if (videoUrl.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || videoUrl.includes("supabase")) {
      return {
        type: "direct",
        embed: videoUrl
      };
    }

    // Unknown - try as direct
    return {
      type: "direct",
      embed: videoUrl
    };
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && onTimeUpdate) {
      const currentTime = Math.floor(videoRef.current.currentTime);
      if (currentTime > 0 && currentTime % 10 === 0) {
        onTimeUpdate(currentTime);
      }
    }
  };

  const handleVideoEnded = () => {
    if (onEnded) {
      onEnded();
    }
  };

  // Listen for YouTube/Vimeo postMessage events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // YouTube
      if (event.origin === "https://www.youtube.com") {
        try {
          const data = JSON.parse(event.data);
          if (data.event === "onStateChange" && data.info === 0) {
            // Video ended (state 0)
            if (onEnded) onEnded();
          }
        } catch (e) {
          // Not a JSON message
        }
      }
      
      // Vimeo
      if (event.origin === "https://player.vimeo.com") {
        try {
          const data = JSON.parse(event.data);
          if (data.event === "finish") {
            if (onEnded) onEnded();
          }
        } catch (e) {
          // Not a JSON message
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onEnded]);

  // No video
  if (videoType === "none" || !url) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center text-background/60 bg-black">
        <PlayCircle className="w-20 h-20 mb-4" />
        <p>Vídeo em breve</p>
      </div>
    );
  }

  // YouTube or Vimeo embed
  if (videoType === "youtube" || videoType === "vimeo") {
    return (
      <iframe
        ref={iframeRef}
        src={embedUrl || ""}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        title="Video player"
      />
    );
  }

  // Direct video
  return (
    <video
      ref={videoRef}
      src={embedUrl || ""}
      controls
      className="w-full h-full"
      onTimeUpdate={handleTimeUpdate}
      onEnded={handleVideoEnded}
      controlsList="nodownload"
    >
      Seu navegador não suporta vídeos.
    </video>
  );
};

export default VideoPlayer;
