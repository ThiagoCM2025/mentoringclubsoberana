import { useState, useRef, useEffect } from "react";
import { Send, FileText, MoreVertical, Phone, Archive, User } from "lucide-react";
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
import type { WhatsAppConversation, WhatsAppMessage } from "@/hooks/useWhatsAppConversations";

interface ChatWindowProps {
  conversation: WhatsAppConversation | null;
  messages: WhatsAppMessage[];
  loading: boolean;
  onSendMessage: (message: string) => Promise<void>;
  onOpenTemplates: () => void;
  onArchive: () => void;
  onViewContact: () => void;
}

export function ChatWindow({
  conversation,
  messages,
  loading,
  onSendMessage,
  onOpenTemplates,
  onArchive,
  onViewContact,
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
      <div className="flex-1 flex flex-col items-center justify-center bg-muted/30 text-center p-8">
        <div className="w-64 h-64 mb-6 opacity-20">
          <svg viewBox="0 0 303 172" className="w-full h-full fill-current text-muted-foreground">
            <path d="M229.565 160.229c-1.471-.599-3.037-1.144-4.687-1.629-2.604-.773-5.398-1.418-8.347-1.943-3.027-.541-6.216-.959-9.533-1.258-3.439-.312-7.024-.475-10.724-.494-3.725.019-7.31.182-10.748.494-3.318.299-6.506.717-9.533 1.258-2.949.525-5.743 1.17-8.347 1.943-1.65.485-3.217 1.03-4.687 1.629-1.457.596-2.831 1.24-4.111 1.926-1.263.683-2.435 1.405-3.505 2.161-.349.246-.683.497-1.006.75l62.487.003c-.323-.253-.659-.504-1.008-.753-1.07-.756-2.242-1.478-3.505-2.161-1.28-.686-2.654-1.33-4.111-1.926h-.001z" />
            <path d="M229.565 160.229c-1.471-.599-3.037-1.144-4.687-1.629-2.604-.773-5.398-1.418-8.347-1.943-3.027-.541-6.216-.959-9.533-1.258-3.439-.312-7.024-.475-10.724-.494-3.725.019-7.31.182-10.748.494-3.318.299-6.506.717-9.533 1.258-2.949.525-5.743 1.17-8.347 1.943-1.65.485-3.217 1.03-4.687 1.629-1.457.596-2.831 1.24-4.111 1.926-1.263.683-2.435 1.405-3.505 2.161-.349.246-.683.497-1.006.75l62.487.003c-.323-.253-.659-.504-1.008-.753-1.07-.756-2.242-1.478-3.505-2.161-1.28-.686-2.654-1.33-4.111-1.926h-.001zM197.892 135.333c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z" />
          </svg>
        </div>
        <h3 className="text-xl font-medium text-muted-foreground mb-2">
          WhatsApp Business
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Selecione uma conversa para visualizar as mensagens ou inicie uma nova conversa.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#efeae2] dark:bg-[#0b141a]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2 bg-card border-b border-border">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
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

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
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
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-muted-foreground">
              Nenhuma mensagem ainda. Envie a primeira!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {groupedMessages.map((group, groupIndex) => (
              <div key={groupIndex}>
                {/* Date separator */}
                <div className="flex justify-center my-4">
                  <span className="px-3 py-1 rounded-lg bg-card/80 text-xs text-muted-foreground shadow-sm">
                    {getDateLabel(group.date)}
                  </span>
                </div>
                {/* Messages */}
                {group.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 bg-card border-t border-border">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0"
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
            className="flex-1 h-10"
            disabled={sending}
          />
          <Button
            size="icon"
            className="h-10 w-10 shrink-0 bg-[#25D366] hover:bg-[#128C7E]"
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
