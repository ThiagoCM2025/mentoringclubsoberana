import { ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
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
} from "lucide-react";
import type { WhatsAppConversation } from "@/hooks/useWhatsAppConversations";

export interface ExtendedWhatsAppConversation extends WhatsAppConversation {
  is_pinned?: boolean;
  is_muted?: boolean;
  is_favorite?: boolean;
  is_blocked?: boolean;
  muted_until?: string | null;
}

interface ConversationContextMenuProps {
  children: ReactNode;
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

export function ConversationContextMenu({
  children,
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
}: ConversationContextMenuProps) {
  const isPinned = conversation.is_pinned ?? false;
  const isMuted = conversation.is_muted ?? false;
  const isFavorite = conversation.is_favorite ?? false;
  const isBlocked = conversation.is_blocked ?? false;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        {/* Archive/Unarchive */}
        {isArchived ? (
          <ContextMenuItem onClick={onUnarchive} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Restaurar conversa
          </ContextMenuItem>
        ) : (
          <ContextMenuItem onClick={onArchive} className="gap-2">
            <Archive className="h-4 w-4" />
            Arquivar conversa
          </ContextMenuItem>
        )}

        {/* Mute notifications */}
        <ContextMenuItem onClick={onMute} className="gap-2">
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
        </ContextMenuItem>

        {/* Pin conversation */}
        {!isArchived && (
          <ContextMenuItem onClick={onPin} className="gap-2">
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
          </ContextMenuItem>
        )}

        {/* Tag conversation */}
        <ContextMenuItem onClick={onTag} className="gap-2">
          <Tag className="h-4 w-4" />
          Etiquetar conversa
        </ContextMenuItem>

        {/* Mark as unread */}
        {!isArchived && (
          <ContextMenuItem onClick={onMarkUnread} className="gap-2">
            <Circle className="h-4 w-4" />
            Marcar como não lida
          </ContextMenuItem>
        )}

        {/* Favorite */}
        <ContextMenuItem onClick={onFavorite} className="gap-2">
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
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Block */}
        <ContextMenuItem onClick={onBlock} className="gap-2 text-orange-600">
          <Ban className="h-4 w-4" />
          {isBlocked ? "Desbloquear" : "Bloquear"}
        </ContextMenuItem>

        {/* Delete */}
        <ContextMenuItem onClick={onDelete} className="gap-2 text-destructive">
          <Trash2 className="h-4 w-4" />
          Apagar conversa
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
