import { Check, CheckCheck, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { WhatsAppMessage } from "@/hooks/useWhatsAppConversations";

interface MessageBubbleProps {
  message: WhatsAppMessage;
  isNew?: boolean;
}

export function MessageBubble({ message, isNew = false }: MessageBubbleProps) {
  const isOutgoing = message.direction === "outgoing";
  const time = format(new Date(message.created_at), "HH:mm", { locale: ptBR });

  const getStatusIcon = () => {
    switch (message.status) {
      case "pending":
        return <Clock className="h-3 w-3 text-muted-foreground" />;
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
        "flex w-full mb-1.5",
        isOutgoing ? "justify-end" : "justify-start",
        isNew && "animate-fade-in"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] rounded-xl px-3 py-2 shadow-sm transition-all",
          isOutgoing
            ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-foreground rounded-tr-sm"
            : "bg-white dark:bg-zinc-800 text-foreground rounded-tl-sm shadow-md"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.message}</p>
        <div
          className={cn(
            "flex items-center gap-1 mt-0.5",
            isOutgoing ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-[10px] text-muted-foreground">{time}</span>
          {isOutgoing && getStatusIcon()}
        </div>
        {message.status === "failed" && message.error_message && (
          <p className="text-[10px] text-destructive mt-1 bg-destructive/10 px-2 py-1 rounded">
            {message.error_message}
          </p>
        )}
      </div>
    </div>
  );
}
