import { Check, CheckCheck, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { HighlightedText } from "./HighlightedText";
import { MediaPreview } from "./MediaPreview";
import type { WhatsAppMessage } from "@/hooks/useWhatsAppConversations";

interface MessageBubbleProps {
  message: WhatsAppMessage;
  searchQuery?: string;
  isCurrentSearchResult?: boolean;
  isNew?: boolean;
}

export function MessageBubble({ 
  message, 
  searchQuery = "",
  isCurrentSearchResult = false,
  isNew = false 
}: MessageBubbleProps) {
  const isOutgoing = message.direction === "outgoing";
  const time = format(new Date(message.created_at), "HH:mm", { locale: ptBR });
  
  const hasMedia = message.media_url && message.media_type;
  const isMediaOnly = hasMedia && (!message.message || message.message === `[${message.media_type?.toUpperCase()}]`);

  const getStatusIcon = () => {
    switch (message.status) {
      case "pending":
        return <Clock className="h-3 w-3 text-muted-foreground animate-pulse" />;
      case "sent":
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-[#53bdeb]" />;
      case "failed":
        return <AlertCircle className="h-3 w-3 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex w-full mb-1.5 px-1",
        isOutgoing ? "justify-end" : "justify-start",
        isNew && "animate-fade-in"
      )}
    >
      <div
        className={cn(
          "max-w-[75%] sm:max-w-[70%] rounded-2xl transition-all duration-200",
          hasMedia ? "p-1" : "px-3 py-2",
          isOutgoing
            ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-foreground rounded-br-md shadow-sm"
            : "bg-white dark:bg-zinc-800 text-foreground rounded-bl-md shadow-md",
          isCurrentSearchResult && "ring-2 ring-orange-500 ring-offset-2 ring-offset-background"
        )}
      >
        {/* Media content */}
        {hasMedia && (
          <div className="mb-1">
            <MediaPreview
              mediaUrl={message.media_url!}
              mediaType={message.media_type!}
              mediaFilename={message.media_filename}
              mediaMimetype={message.media_mimetype}
              isOutgoing={isOutgoing}
            />
          </div>
        )}
        
        {/* Text content */}
        {message.message && !isMediaOnly && (
          <p className={cn(
            "text-sm whitespace-pre-wrap break-words leading-relaxed",
            hasMedia && "px-2 pb-1"
          )}>
            {searchQuery.trim() ? (
              <HighlightedText 
                text={message.message} 
                searchQuery={searchQuery}
                isCurrentResult={isCurrentSearchResult}
              />
            ) : (
              message.message
            )}
          </p>
        )}
        
        {/* Time and status */}
        <div
          className={cn(
            "flex items-center gap-1 mt-0.5",
            isOutgoing ? "justify-end" : "justify-start",
            hasMedia && "px-2"
          )}
        >
          <span className="text-[10px] text-muted-foreground/70">{time}</span>
          {isOutgoing && (
            <span className="flex items-center">
              {getStatusIcon()}
            </span>
          )}
        </div>
        
        {message.status === "failed" && message.error_message && (
          <p className={cn(
            "text-[10px] text-destructive mt-1.5 bg-destructive/10 px-2 py-1 rounded-md",
            hasMedia && "mx-1"
          )}>
            {message.error_message}
          </p>
        )}
      </div>
    </div>
  );
}
