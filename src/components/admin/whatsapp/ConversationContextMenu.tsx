import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Archive,
  Bell,
  BellOff,
  Pin,
  PinOff,
  Tag,
  Circle,
  Star,
  StarOff,
  Ban,
  Trash2,
  RotateCcw,
  ChevronDown,
  Check,
} from "lucide-react";
import type { WhatsAppConversation } from "@/hooks/useWhatsAppConversations";
import { useConversationTags } from "@/hooks/useConversationTags";

export interface ExtendedWhatsAppConversation extends WhatsAppConversation {
  is_pinned?: boolean;
  is_muted?: boolean;
  is_favorite?: boolean;
  is_blocked?: boolean;
  muted_until?: string | null;
}

interface ConversationDropdownMenuProps {
  conversation: ExtendedWhatsAppConversation;
  onArchive: () => void;
  onUnarchive?: () => void;
  onPin: () => void;
  onMute: () => void;
  onFavorite: () => void;
  onBlock: () => void;
  onMarkUnread: () => void;
  onDelete: () => void;
  isArchived?: boolean;
}

export function ConversationDropdownMenu({
  conversation,
  onArchive,
  onUnarchive,
  onPin,
  onMute,
  onFavorite,
  onBlock,
  onMarkUnread,
  onDelete,
  isArchived = false,
}: ConversationDropdownMenuProps) {
  const isPinned = conversation.is_pinned ?? false;
  const isMuted = conversation.is_muted ?? false;
  const isFavorite = conversation.is_favorite ?? false;
  const isBlocked = conversation.is_blocked ?? false;

  const { tags, availableTags, toggleTag, loading } = useConversationTags(conversation.id);
  const hasTag = (tagId: string) => tags.some((t) => t.id === tagId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="opacity-0 group-hover:opacity-100 absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-card hover:bg-muted flex items-center justify-center transition-all duration-200 shadow-sm border border-border/50 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-lg z-50">
        {/* Archive/Unarchive */}
        {isArchived ? (
          <DropdownMenuItem onClick={onUnarchive} className="gap-2 cursor-pointer">
            <RotateCcw className="h-4 w-4" />
            Restaurar conversa
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={onArchive} className="gap-2 cursor-pointer">
            <Archive className="h-4 w-4" />
            Arquivar conversa
          </DropdownMenuItem>
        )}

        {/* Mute notifications */}
        <DropdownMenuItem onClick={onMute} className="gap-2 cursor-pointer">
          {isMuted ? (
            <>
              <Bell className="h-4 w-4" />
              Ativar notificações
            </>
          ) : (
            <>
              <BellOff className="h-4 w-4" />
              Silenciar notificações
            </>
          )}
        </DropdownMenuItem>

        {/* Pin conversation */}
        {!isArchived && (
          <DropdownMenuItem onClick={onPin} className="gap-2 cursor-pointer">
            {isPinned ? (
              <>
                <PinOff className="h-4 w-4" />
                Desafixar conversa
              </>
            ) : (
              <>
                <Pin className="h-4 w-4" />
                Fixar conversa
              </>
            )}
          </DropdownMenuItem>
        )}

        {/* Tag conversation - Submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="gap-2 cursor-pointer">
            <Tag className="h-4 w-4" />
            Tags da conversa
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-52">
            {availableTags.length === 0 ? (
              <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                Nenhuma tag disponível
              </div>
            ) : (
              availableTags.map((tag) => (
                <DropdownMenuItem
                  key={tag.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleTag(tag.id);
                  }}
                  disabled={loading}
                  className="gap-2 cursor-pointer"
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="flex-1">{tag.name}</span>
                  {hasTag(tag.id) && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Mark as unread */}
        {!isArchived && (
          <DropdownMenuItem onClick={onMarkUnread} className="gap-2 cursor-pointer">
            <Circle className="h-4 w-4" />
            Marcar como não lida
          </DropdownMenuItem>
        )}

        {/* Favorite */}
        <DropdownMenuItem onClick={onFavorite} className="gap-2 cursor-pointer">
          {isFavorite ? (
            <>
              <StarOff className="h-4 w-4" />
              Remover dos favoritos
            </>
          ) : (
            <>
              <Star className="h-4 w-4" />
              Adicionar aos favoritos
            </>
          )}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Block */}
        <DropdownMenuItem onClick={onBlock} className="gap-2 text-orange-600 cursor-pointer">
          <Ban className="h-4 w-4" />
          {isBlocked ? "Desbloquear" : "Bloquear"}
        </DropdownMenuItem>

        {/* Delete */}
        <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive cursor-pointer">
          <Trash2 className="h-4 w-4" />
          Apagar conversa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Keep old export name for backwards compatibility (but it now uses dropdown)
export const ConversationContextMenu = ConversationDropdownMenu;
