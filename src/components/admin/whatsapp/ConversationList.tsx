import { useState, useMemo } from "react";
import { Search, Archive, MessageSquarePlus, RotateCcw, ChevronDown, ChevronUp, Pin, BellOff, Star, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDistanceToNow, isToday, isThisWeek, isThisMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn, shortenName } from "@/lib/utils";
import { ConversationFiltersPopover, type ConversationFilters } from "./ConversationFilters";
import { PushNotificationToggle } from "./PushNotificationToggle";
import { ConversationDropdownMenu, type ExtendedWhatsAppConversation } from "./ConversationContextMenu";
import { useConversationTagsBatch } from "@/hooks/useConversationTags";
import type { WhatsAppConversation } from "@/hooks/useWhatsAppConversations";

interface ConversationListProps {
  conversations: WhatsAppConversation[];
  archivedConversations: WhatsAppConversation[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (conversation: WhatsAppConversation) => void;
  onNewConversation: () => void;
  onUnarchive: (conversationId: string) => void;
  onDelete?: (conversationId: string) => void;
  onArchive?: (conversationId: string) => void;
  onPin?: (conversationId: string, pin: boolean) => void;
  onMute?: (conversationId: string, mute: boolean) => void;
  onFavorite?: (conversationId: string, favorite: boolean) => void;
  onBlock?: (conversationId: string, block: boolean) => void;
  onMarkUnread?: (conversationId: string) => void;
}

export function ConversationList({
  conversations,
  archivedConversations,
  loading,
  selectedId,
  onSelect,
  onNewConversation,
  onUnarchive,
  onDelete,
  onArchive,
  onPin,
  onMute,
  onFavorite,
  onBlock,
  onMarkUnread,
}: ConversationListProps) {
  const [search, setSearch] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<WhatsAppConversation | null>(null);

  // Get all conversation IDs for batch tag fetching
  const conversationIds = useMemo(() => 
    [...conversations, ...archivedConversations].map(c => c.id),
    [conversations, archivedConversations]
  );

  const { tagsMap, refetch: refetchTags } = useConversationTagsBatch(conversationIds);

  const [filters, setFilters] = useState<ConversationFilters>({
    contactType: "all",
    dateRange: "all",
    hasUnread: false,
  });

  // Apply filters
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      const searchLower = search.toLowerCase();
      
      // Text search
      const matchesSearch =
        c.contact_name?.toLowerCase().includes(searchLower) ||
        c.phone.includes(search) ||
        c.last_message_preview?.toLowerCase().includes(searchLower);

      // Contact type filter
      const matchesType =
        filters.contactType === "all" || c.contact_type === filters.contactType;

      // Date range filter
      const messageDate = new Date(c.last_message_at);
      let matchesDate = true;
      if (filters.dateRange === "today") {
        matchesDate = isToday(messageDate);
      } else if (filters.dateRange === "week") {
        matchesDate = isThisWeek(messageDate, { weekStartsOn: 0 });
      } else if (filters.dateRange === "month") {
        matchesDate = isThisMonth(messageDate);
      }

      // Unread filter
      const matchesUnread = !filters.hasUnread || c.unread_count > 0;

      return matchesSearch && matchesType && matchesDate && matchesUnread;
    });
  }, [conversations, search, filters]);

  const filteredArchived = useMemo(() => {
    return archivedConversations.filter((c) => {
      const searchLower = search.toLowerCase();
      return (
        c.contact_name?.toLowerCase().includes(searchLower) ||
        c.phone.includes(search) ||
        c.last_message_preview?.toLowerCase().includes(searchLower)
      );
    });
  }, [archivedConversations, search]);

  const truncateMessage = (message: string | null, maxLength: number = 35) => {
    if (!message) return "Nova conversa";
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

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

  const renderConversationItem = (conversation: WhatsAppConversation, isArchived = false) => {
    const hasUnread = conversation.unread_count > 0 && selectedId !== conversation.id;
    const isSelected = selectedId === conversation.id;
    const displayName = shortenName(conversation.contact_name, 22) || formatPhone(conversation.phone);
    const extConv = conversation as ExtendedWhatsAppConversation;
    const hasContextMenu = onArchive && onPin && onMute && onFavorite && onBlock && onMarkUnread && onDelete;
    const conversationTags = tagsMap[conversation.id] || [];
    
    return (
      <div
        key={conversation.id}
        className={cn(
          "relative w-full flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 pr-9 sm:pr-10 text-left group min-h-[60px] touch-target",
          "transition-all duration-200 ease-out",
          isArchived ? "opacity-70" : "",
          !isArchived && "hover:bg-muted/60 cursor-pointer active:bg-muted/80",
          isSelected && "bg-[#25D366]/10 border-l-2 border-[#25D366] shadow-sm"
        )}
        onClick={() => !isArchived && onSelect(conversation)}
      >
        <div className="relative flex-shrink-0">
          <Avatar className={cn(
            "h-10 w-10 sm:h-12 sm:w-12 transition-all duration-200",
            hasUnread && "ring-2 ring-[#25D366]/50 ring-offset-2 ring-offset-background"
          )}>
            <AvatarFallback className={cn(
              "text-xs sm:text-sm font-semibold transition-colors",
              isSelected 
                ? "bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white"
                : hasUnread
                  ? "bg-[#25D366]/20 text-[#128C7E]"
                  : isArchived
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary/10 text-primary"
            )}>
              {getInitials(conversation.contact_name, conversation.phone)}
            </AvatarFallback>
          </Avatar>
          {hasUnread && !isArchived && (
            <span className="absolute -top-0.5 -right-0.5 h-4 sm:h-5 min-w-4 sm:min-w-5 px-1 rounded-full bg-[#25D366] text-white text-[10px] sm:text-xs flex items-center justify-center font-bold shadow-lg shadow-[#25D366]/30 animate-pulse">
              {conversation.unread_count > 9 ? "9+" : conversation.unread_count}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className={cn(
                "font-medium truncate",
                hasUnread ? "text-foreground" : "text-foreground"
              )}>
                {displayName}
              </span>
              {/* Tags - show max 2 emojis on mobile for compact view */}
              {conversationTags.length > 0 && (
                <TooltipProvider delayDuration={200}>
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {conversationTags.slice(0, 2).map((tag) => {
                      const emojiMatch = tag.name.match(/^(\p{Emoji_Presentation}|\p{Emoji}\uFE0F?)/u);
                      const emoji = emojiMatch ? emojiMatch[0] : tag.name.charAt(0);
                      
                      return (
                        <Tooltip key={tag.id}>
                          <TooltipTrigger asChild>
                            <span className="text-sm flex-shrink-0 cursor-default">
                              {emoji}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            {tag.name}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                    {conversationTags.length > 2 && (
                      <span className="text-[10px] text-muted-foreground">
                        +{conversationTags.length - 2}
                      </span>
                    )}
                  </div>
                </TooltipProvider>
              )}
            </div>
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
          <div className="flex items-center gap-1 mt-0.5">
            <p className={cn(
              "text-sm truncate flex-1",
              hasUnread
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            )}>
              {truncateMessage(conversation.last_message_preview)}
            </p>
            {/* Status indicators */}
            {extConv.is_pinned && <Pin className="h-3 w-3 text-muted-foreground" />}
            {extConv.is_muted && <BellOff className="h-3 w-3 text-muted-foreground" />}
            {extConv.is_favorite && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
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

        {isArchived && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0 hover:bg-[#25D366]/10"
            onClick={(e) => {
              e.stopPropagation();
              onUnarchive(conversation.id);
            }}
            title="Restaurar conversa"
          >
            <RotateCcw className="h-4 w-4 text-[#25D366]" />
          </Button>
        )}

        {/* Dropdown menu trigger - visible on hover */}
        {hasContextMenu && (
          <ConversationDropdownMenu
            conversation={extConv}
            onArchive={() => onArchive(conversation.id)}
            onUnarchive={() => onUnarchive(conversation.id)}
            onPin={() => onPin(conversation.id, !extConv.is_pinned)}
            onMute={() => onMute(conversation.id, !extConv.is_muted)}
            onFavorite={() => onFavorite(conversation.id, !extConv.is_favorite)}
            onBlock={() => onBlock(conversation.id, !extConv.is_blocked)}
            onMarkUnread={() => onMarkUnread(conversation.id)}
            onDelete={() => setConversationToDelete(conversation)}
            isArchived={isArchived}
            onTagsChange={refetchTags}
          />
        )}
      </div>
    );
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
      {/* Header - compact on mobile */}
      <div className="p-2.5 sm:p-3 border-b border-border space-y-2 sm:space-y-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground text-sm sm:text-base">Conversas</h3>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <PushNotificationToggle />
            <ConversationFiltersPopover
              filters={filters}
              onFiltersChange={setFilters}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewConversation}
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <MessageSquarePlus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 sm:pl-9 h-9 bg-muted/50 text-sm"
          />
        </div>
      </div>

      {/* Conversation list */}
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 && filteredArchived.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <Archive className="h-12 w-12 mb-3 opacity-50" />
            <p className="text-sm">
              {search ? "Nenhuma conversa encontrada" : "Nenhuma conversa ainda"}
            </p>
          </div>
        ) : (
          <div>
            {/* Active conversations */}
            <div className="divide-y divide-border/50">
              {filteredConversations.map((conversation) => renderConversationItem(conversation))}
            </div>

            {/* Archived section */}
            {filteredArchived.length > 0 && (
              <Collapsible open={showArchived} onOpenChange={setShowArchived}>
                <CollapsibleTrigger asChild>
                  <button className="w-full flex items-center justify-between p-3 text-sm text-muted-foreground hover:bg-muted/50 transition-colors border-t border-border">
                    <div className="flex items-center gap-2">
                      <Archive className="h-4 w-4" />
                      <span>Arquivadas ({filteredArchived.length})</span>
                    </div>
                    {showArchived ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="divide-y divide-border/50 bg-muted/20">
                    {filteredArchived.map((conversation) => renderConversationItem(conversation, true))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Confirmation dialog for delete */}
      <AlertDialog open={!!conversationToDelete} onOpenChange={(open) => !open && setConversationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conversa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação vai excluir permanentemente a conversa com{" "}
              <strong>{conversationToDelete?.contact_name || conversationToDelete?.phone}</strong>{" "}
              e todas as mensagens. Isso não pode ser desfeito.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (conversationToDelete && onDelete) {
                  onDelete(conversationToDelete.id);
                  setConversationToDelete(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
