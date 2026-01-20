import { Check, CheckCheck, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { WhatsAppMessage } from "@/hooks/useWhatsAppConversations";

interface MessageBubbleProps {
  message: WhatsAppMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
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
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case "failed":
        return <AlertCircle className="h-3 w-3 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        "flex w-full mb-1",
        isOutgoing ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[70%] rounded-lg px-3 py-2 shadow-sm",
          isOutgoing
            ? "bg-[#d9fdd3] dark:bg-[#005c4b] text-foreground rounded-tr-none"
            : "bg-card text-foreground rounded-tl-none"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
        <div
          className={cn(
            "flex items-center gap-1 mt-1",
            isOutgoing ? "justify-end" : "justify-start"
          )}
        >
          <span className="text-[10px] text-muted-foreground">{time}</span>
          {isOutgoing && getStatusIcon()}
        </div>
        {message.status === "failed" && message.error_message && (
          <p className="text-[10px] text-destructive mt-1">{message.error_message}</p>
        )}
      </div>
    </div>
  );
}
