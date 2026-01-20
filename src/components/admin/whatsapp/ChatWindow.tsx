import { useState, useRef, useEffect } from "react";
import { Send, FileText, MoreVertical, Archive, User, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageBubble } from "./MessageBubble";
import { EmojiPicker } from "./EmojiPicker";
import type { WhatsAppConversation, WhatsAppMessage } from "@/hooks/useWhatsAppConversations";

interface ChatWindowProps {
  conversation: WhatsAppConversation | null;
  messages: WhatsAppMessage[];
  loading: boolean;
  onSendMessage: (message: string) => Promise<void>;
  onOpenTemplates: () => void;
  onArchive: () => void;
  onViewContact: () => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
}

export function ChatWindow({
  conversation,
  messages,
  loading,
  onSendMessage,
  onOpenTemplates,
  onArchive,
  onViewContact,
  soundEnabled = true,
  onToggleSound,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || sending) return;

    setSending(true);
    const message = inputValue;
    setInputValue("");

    try {
      await onSendMessage(message);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputValue((prev) => prev + emoji);
    inputRef.current?.focus();
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

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Hoje";
    if (isYesterday(date)) return "Ontem";
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  // Group messages by date
  const groupedMessages = messages.reduce<{ date: Date; messages: WhatsAppMessage[] }[]>(
    (groups, message) => {
      const messageDate = new Date(message.created_at);
      const lastGroup = groups[groups.length - 1];

      if (lastGroup && isSameDay(lastGroup.date, messageDate)) {
        lastGroup.messages.push(message);
      } else {
        groups.push({ date: messageDate, messages: [message] });
      }

      return groups;
    },
    []
  );

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-muted/30 to-muted/50">
        <div className="text-center text-muted-foreground">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#25D366]/10 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-10 h-10 text-[#25D366]"
              fill="currentColor"
            >
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z" />
            </svg>
          </div>
          <p className="text-lg font-medium">Selecione uma conversa</p>
          <p className="text-sm mt-1">Escolha uma conversa à esquerda para começar</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#efeae2] dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-card border-b border-border shadow-sm">
        <Avatar className="h-10 w-10 ring-2 ring-[#25D366]/20">
          <AvatarFallback className="bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white text-sm font-semibold">
            {getInitials(conversation.contact_name, conversation.phone)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground truncate">
              {conversation.contact_name || formatPhone(conversation.phone)}
            </h3>
            {conversation.contact_type === "student" && (
              <Badge variant="secondary" className="text-[10px]">
                Aluna
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatPhone(conversation.phone)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {onToggleSound && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSound}
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
            >
              {soundEnabled ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onViewContact}>
                <User className="h-4 w-4 mr-2" />
                Ver contato
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onArchive}>
                <Archive className="h-4 w-4 mr-2" />
                Arquivar conversa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea 
        className="flex-1 px-4" 
        ref={scrollRef}
      >
        <div 
          className="py-4 min-h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
                >
                  <Skeleton className="h-12 w-48 rounded-lg" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-20">
              <p className="text-sm text-muted-foreground">
                Nenhuma mensagem ainda. Envie a primeira!
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {groupedMessages.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {/* Date separator */}
                  <div className="flex justify-center my-4">
                    <span className="px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm text-xs text-muted-foreground shadow-sm">
                      {getDateLabel(group.date)}
                    </span>
                  </div>
                  {/* Messages */}
                  {group.messages.map((message, index) => (
                    <MessageBubble 
                      key={message.id} 
                      message={message} 
                      isNew={groupIndex === groupedMessages.length - 1 && index === group.messages.length - 1}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 bg-card border-t border-border">
        <div className="flex items-center gap-2">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0 text-muted-foreground hover:text-foreground"
            onClick={onOpenTemplates}
          >
            <FileText className="h-5 w-5" />
          </Button>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem..."
            className="flex-1 h-10 rounded-full bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-[#25D366]/50"
            disabled={sending}
          />
          <Button
            size="icon"
            className="h-10 w-10 shrink-0 rounded-full bg-[#25D366] hover:bg-[#128C7E] shadow-md transition-all hover:scale-105"
            onClick={handleSend}
            disabled={!inputValue.trim() || sending}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
