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
import { cn } from "@/lib/utils";
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
          <div className="divide-y divide-border">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelect(conversation)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-all text-left",
                  selectedId === conversation.id && "bg-[#25D366]/10 border-l-2 border-[#25D366]"
                )}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12 ring-2 ring-transparent transition-all group-hover:ring-[#25D366]/20">
                    <AvatarFallback className={cn(
                      "text-sm font-medium transition-colors",
                      selectedId === conversation.id 
                        ? "bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white"
                        : "bg-primary/10 text-primary"
                    )}>
                      {getInitials(conversation.contact_name, conversation.phone)}
                    </AvatarFallback>
                  </Avatar>
                  {/* Badge only shows when not selected and has unread */}
                  {conversation.unread_count > 0 && selectedId !== conversation.id && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#25D366] text-white text-xs flex items-center justify-center font-medium animate-pulse shadow-md">
                      {conversation.unread_count > 9 ? "9+" : conversation.unread_count}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "font-medium truncate transition-colors",
                      conversation.unread_count > 0 && selectedId !== conversation.id
                        ? "text-foreground"
                        : "text-foreground"
                    )}>
                      {conversation.contact_name || formatPhone(conversation.phone)}
                    </span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(conversation.last_message_at), {
                        addSuffix: false,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className={cn(
                      "text-sm truncate flex-1",
                      conversation.unread_count > 0 && selectedId !== conversation.id
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    )}>
                      {conversation.last_message_preview || "Nova conversa"}
                    </p>
                    {conversation.contact_type === "student" && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Aluna
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
