import { useState } from "react";
import { Search, Archive, MessageSquarePlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn, shortenName } from "@/lib/utils";
import type { WhatsAppConversation } from "@/hooks/useWhatsAppConversations";

interface ConversationListProps {
  conversations: WhatsAppConversation[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (conversation: WhatsAppConversation) => void;
  onNewConversation: () => void;
}

export function ConversationList({
  conversations,
  loading,
  selectedId,
  onSelect,
  onNewConversation,
}: ConversationListProps) {
  const [search, setSearch] = useState("");

  const filteredConversations = conversations.filter((c) => {
    const searchLower = search.toLowerCase();
    return (
      c.contact_name?.toLowerCase().includes(searchLower) ||
      c.phone.includes(search) ||
      c.last_message_preview?.toLowerCase().includes(searchLower)
    );
  });

  const getInitials = (name: string | null, phone: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    }
    return phone.slice(-2);
  };

  const formatPhone = (phone: string) => {
    if (phone.length === 13) {
      return `+${phone.slice(0, 2)} (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}`;
    }
    if (phone.length === 12) {
      return `+${phone.slice(0, 2)} (${phone.slice(2, 4)}) ${phone.slice(4, 8)}-${phone.slice(8)}`;
    }
    return phone;
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3 border-b border-border">
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="flex-1 p-2 space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Header */}
      <div className="p-3 border-b border-border space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Conversas</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNewConversation}
            className="h-8 w-8"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-muted/50"
          />
        </div>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <Archive className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">
              {search ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filteredConversations.map((conversation) => {
              const hasUnread = conversation.unread_count > 0 && selectedId !== conversation.id;
              const isSelected = selectedId === conversation.id;
              const displayName = shortenName(conversation.contact_name, 22) || formatPhone(conversation.phone);
              
              return (
                <button
                  key={conversation.id}
                  onClick={() => onSelect(conversation)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 text-left",
                    "transition-all duration-200 ease-out",
                    "hover:bg-muted/60 hover:-translate-y-[1px] hover:shadow-sm",
                    isSelected && "bg-[#25D366]/10 border-l-2 border-[#25D366] shadow-sm"
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar className={cn(
                      "h-12 w-12 transition-all duration-200",
                      hasUnread && "ring-2 ring-[#25D366]/50 ring-offset-2 ring-offset-background"
                    )}>
                      <AvatarFallback className={cn(
                        "text-sm font-semibold transition-colors",
                        isSelected 
                          ? "bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white"
                          : hasUnread
                            ? "bg-[#25D366]/20 text-[#128C7E]"
                            : "bg-primary/10 text-primary"
                      )}>
                        {getInitials(conversation.contact_name, conversation.phone)}
                      </AvatarFallback>
                    </Avatar>
                    {hasUnread && (
                      <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1 rounded-full bg-[#25D366] text-white text-xs flex items-center justify-center font-bold shadow-lg shadow-[#25D366]/30 animate-pulse">
                        {conversation.unread_count > 9 ? "9+" : conversation.unread_count}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <span className={cn(
                        "font-medium truncate max-w-[140px]",
                        hasUnread ? "text-foreground" : "text-foreground"
                      )}>
                        {displayName}
                      </span>
                      <span className={cn(
                        "text-[10px] whitespace-nowrap flex-shrink-0",
                        hasUnread ? "text-[#25D366] font-semibold" : "text-muted-foreground"
                      )}>
                        {formatDistanceToNow(new Date(conversation.last_message_at), {
                          addSuffix: false,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className={cn(
                        "text-sm truncate flex-1",
                        hasUnread
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      )}>
                        {conversation.last_message_preview || "Nova conversa"}
                      </p>
                      {conversation.contact_type === "student" && (
                        <Badge 
                          variant="secondary" 
                          className="text-[9px] px-1.5 py-0 h-4 flex-shrink-0 bg-primary/10 text-primary"
                        >
                          Aluna
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
