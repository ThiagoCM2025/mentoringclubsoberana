import { useState, useRef, useEffect, useMemo } from "react";
import { Send, FileText, MoreVertical, Archive, User, Volume2, VolumeX, ArrowLeft, Search, ChevronUp, ChevronDown, X } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageBubble } from "./MessageBubble";
import { EmojiPicker } from "./EmojiPicker";
import { TypingIndicator } from "./TypingIndicator";
import { MediaUploadButton } from "./MediaUploadButton";
import { ConversationTagPicker } from "./ConversationTagPicker";
import { VoiceRecorder } from "./VoiceRecorder";
import { cn, shortenName } from "@/lib/utils";
import { useTypingStatus } from "@/hooks/useTypingStatus";
import { useDebounce } from "@/hooks/useDebounce";
import { motion, AnimatePresence } from "framer-motion";
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
  onBack?: () => void;
  onMediaSent?: () => void;
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
  onBack,
  onMediaSent,
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const displayName = shortenName(conversation?.contact_name, 28);
  const { isContactTyping } = useTypingStatus(conversation?.id ?? null);
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Find messages that match the search query
  const searchResults = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return [];
    
    const query = debouncedSearchQuery.toLowerCase();
    return messages
      .filter(msg => msg.message.toLowerCase().includes(query))
      .map(msg => msg.id);
  }, [messages, debouncedSearchQuery]);

  // Current result message ID
  const currentResultId = searchResults[currentResultIndex] ?? null;

  // Scroll to current search result
  useEffect(() => {
    if (currentResultId && messageRefs.current.has(currentResultId)) {
      const element = messageRefs.current.get(currentResultId);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentResultId]);

  // Scroll to bottom when messages change (only if not searching)
  useEffect(() => {
    if (!isSearchOpen && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isSearchOpen]);

  // Reset search when conversation changes
  useEffect(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setCurrentResultIndex(0);
  }, [conversation?.id]);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // Reset current index when search results change
  useEffect(() => {
    setCurrentResultIndex(0);
  }, [searchResults.length]);

  const navigateResults = (direction: number) => {
    if (searchResults.length === 0) return;
    
    setCurrentResultIndex(prev => {
      const newIndex = prev + direction;
      if (newIndex < 0) return searchResults.length - 1;
      if (newIndex >= searchResults.length) return 0;
      return newIndex;
    });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsSearchOpen(false);
      setSearchQuery("");
    } else if (e.key === "Enter") {
      e.preventDefault();
      navigateResults(e.shiftKey ? -1 : 1);
    }
  };

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
    <div className={cn(
      "flex-1 flex flex-col bg-[#efeae2] dark:bg-zinc-900 relative",
      !conversation && "hidden sm:flex"
    )}>
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 sm:py-2.5 bg-card border-b border-border shadow-sm relative z-10">
        {/* Back button - mobile only */}
        {onBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-9 w-9 sm:hidden text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        
        <Avatar className="h-9 w-9 sm:h-10 sm:w-10 ring-2 ring-[#25D366]/20 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white text-xs sm:text-sm font-semibold">
            {getInitials(conversation.contact_name, conversation.phone)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h3 className="font-medium text-foreground text-sm sm:text-base truncate max-w-[140px] sm:max-w-none">
              {displayName || formatPhone(conversation.phone)}
            </h3>
            {conversation.contact_type === "student" && (
              <Badge variant="secondary" className="text-[9px] sm:text-[10px] h-4 px-1.5 flex-shrink-0">
                Aluna
              </Badge>
            )}
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
            {formatPhone(conversation.phone)}
          </p>
        </div>
        
        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          {/* Tags picker */}
          {conversation && (
            <ConversationTagPicker conversationId={conversation.id} compact />
          )}
          
          {/* Search button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground"
              >
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-xs">
              Buscar mensagens
            </TooltipContent>
          </Tooltip>
          
          {onToggleSound && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleSound}
                  className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground"
                >
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                {soundEnabled ? "Som ativado" : "Som desativado"}
              </TooltipContent>
            </Tooltip>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5" />
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

      {/* Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="absolute inset-x-0 top-[52px] sm:top-[56px] bg-card border-b border-border shadow-lg z-20 overflow-hidden"
          >
            <div className="flex items-center gap-2 p-2 sm:p-3">
              <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Buscar mensagens..."
                className="flex-1 h-8 text-sm"
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap min-w-[70px] text-center">
                {searchResults.length > 0
                  ? `${currentResultIndex + 1} de ${searchResults.length}`
                  : debouncedSearchQuery.trim() ? "0 resultados" : ""}
              </span>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateResults(-1)}
                  disabled={searchResults.length === 0}
                  className="h-7 w-7"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateResults(1)}
                  disabled={searchResults.length === 0}
                  className="h-7 w-7"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
                className="h-7 w-7"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <ScrollArea className={cn(
        "flex-1 px-2 sm:px-4",
        isSearchOpen && "pt-12"
      )}>
        <div 
          className="py-3 sm:py-4 min-h-full"
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
                  <Skeleton className="h-12 w-48 rounded-2xl" />
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
            <div className="space-y-0.5">
              {groupedMessages.map((group, groupIndex) => (
                <div key={groupIndex}>
                  {/* Date separator */}
                  <div className="flex justify-center my-3 sm:my-4">
                    <span className="px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm text-[10px] sm:text-xs text-muted-foreground shadow-sm border border-border/30">
                      {getDateLabel(group.date)}
                    </span>
                  </div>
                  {/* Messages */}
                  {group.messages.map((message, index) => (
                    <div
                      key={message.id}
                      ref={(el) => {
                        if (el) {
                          messageRefs.current.set(message.id, el);
                        } else {
                          messageRefs.current.delete(message.id);
                        }
                      }}
                    >
                      <MessageBubble 
                        message={message}
                        searchQuery={debouncedSearchQuery}
                        isCurrentSearchResult={message.id === currentResultId}
                        isNew={groupIndex === groupedMessages.length - 1 && index === group.messages.length - 1}
                      />
                    </div>
                  ))}
                </div>
              ))}
              
              {/* Typing indicator */}
              <AnimatePresence>
                {isContactTyping && <TypingIndicator />}
              </AnimatePresence>
              
              {/* Scroll anchor */}
              <div ref={scrollRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input - Modern design */}
      <div className="p-2 sm:p-3 bg-gradient-to-t from-card via-card to-card/80 border-t border-border">
        <div className="flex items-center gap-1 sm:gap-2 bg-muted/60 rounded-2xl p-1 sm:p-1.5">
          <EmojiPicker onEmojiSelect={handleEmojiSelect} className="flex-shrink-0" />
          
          {/* Media upload button */}
          {conversation && (
            <MediaUploadButton
              conversationId={conversation.id}
              phone={conversation.phone}
              onMediaSent={onMediaSent || (() => {})}
              disabled={sending}
            />
          )}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-full flex-shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                onClick={onOpenTemplates}
              >
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Templates
            </TooltipContent>
          </Tooltip>
          
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem..."
            className="flex-1 h-9 sm:h-10 rounded-full bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 text-sm"
            disabled={sending}
          />
          
          {/* Show Send button or Voice Recorder based on input */}
          {inputValue.trim() ? (
            <Button
              size="icon"
              className={cn(
                "h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 rounded-full shadow-md transition-all duration-200",
                "bg-[#25D366] hover:bg-[#128C7E] hover:scale-105 hover:shadow-lg"
              )}
              onClick={handleSend}
              disabled={sending}
            >
              <Send className={cn(
                "h-4 w-4 sm:h-5 sm:w-5 transition-transform",
                sending && "animate-pulse"
              )} />
            </Button>
          ) : conversation ? (
            <VoiceRecorder
              conversationId={conversation.id}
              phone={conversation.phone}
              onMessageSent={onMediaSent || (() => {})}
              disabled={sending}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
