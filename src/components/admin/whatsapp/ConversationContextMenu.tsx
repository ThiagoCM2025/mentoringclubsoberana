import { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
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
} from "lucide-react";
import type { WhatsAppConversation } from "@/hooks/useWhatsAppConversations";

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
  onTag: () => void;
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
  onTag,
  onDelete,
  isArchived = false,
}: ConversationDropdownMenuProps) {
  const isPinned = conversation.is_pinned ?? false;
  const isMuted = conversation.is_muted ?? false;
  const isFavorite = conversation.is_favorite ?? false;
  const isBlocked = conversation.is_blocked ?? false;

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

        {/* Tag conversation */}
        <DropdownMenuItem onClick={onTag} className="gap-2 cursor-pointer">
          <Tag className="h-4 w-4" />
          Etiquetar conversa
        </DropdownMenuItem>

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
