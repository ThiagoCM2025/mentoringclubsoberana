import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface User {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface MentionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onMention: (userId: string, userName: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
}

export const MentionAutocomplete = ({
  value,
  onChange,
  onMention,
  placeholder,
  className,
  rows = 5
}: MentionAutocompleteProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (searchTerm.length >= 1) {
      fetchSuggestions(searchTerm);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const fetchSuggestions = async (term: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, full_name, avatar_url")
      .ilike("full_name", `%${term}%`)
      .limit(5);

    if (data) {
      setSuggestions(data);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newCursorPosition = e.target.selectionStart;
    setCursorPosition(newCursorPosition);
    onChange(newValue);

    // Check if we're typing a mention
    const textBeforeCursor = newValue.slice(0, newCursorPosition);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);

    if (atMatch) {
      setMentionStart(newCursorPosition - atMatch[0].length);
      setSearchTerm(atMatch[1]);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setSearchTerm("");
      setMentionStart(-1);
    }
  };

  const handleSelectUser = (user: User) => {
    const userName = user.full_name || "Usuário";
    const beforeMention = value.slice(0, mentionStart);
    const afterMention = value.slice(cursorPosition);
    const newValue = `${beforeMention}@${userName} ${afterMention}`;
    
    onChange(newValue);
    onMention(user.user_id, userName);
    setShowSuggestions(false);
    setSearchTerm("");
    setMentionStart(-1);

    // Focus back on textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPosition = beforeMention.length + userName.length + 2;
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          className
        )}
      />

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-0 right-0 z-50 mt-1 bg-zinc-800 border border-secondary/30 rounded-lg shadow-lg overflow-hidden"
          >
            {suggestions.map((user) => (
              <button
                key={user.user_id}
                onClick={() => handleSelectUser(user)}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-secondary/20 transition-colors text-left"
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar_url || undefined} />
                  <AvatarFallback className="bg-secondary/20 text-secondary text-xs">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-cream text-sm">{user.full_name || "Usuário"}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MentionAutocomplete;