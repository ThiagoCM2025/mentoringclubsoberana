import { useState } from "react";
import { Tag, Check, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useConversationTags, type ConversationTag } from "@/hooks/useConversationTags";

interface ConversationTagPickerProps {
  conversationId: string;
  compact?: boolean;
}

export function ConversationTagPicker({ 
  conversationId, 
  compact = false 
}: ConversationTagPickerProps) {
  const [open, setOpen] = useState(false);
  const { tags, availableTags, toggleTag, loading } = useConversationTags(conversationId);

  const hasTag = (tagId: string) => tags.some((t) => t.id === tagId);

  if (compact) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-foreground relative"
              >
                <Tag className="h-4 w-4 sm:h-5 sm:w-5" />
                {tags.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center font-medium">
                    {tags.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Tags da conversa
          </TooltipContent>
        </Tooltip>

        <PopoverContent align="end" className="w-64 p-2">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground px-2 py-1">
              Tags da conversa
            </p>
            
            {availableTags.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">
                Nenhuma tag disponível
              </p>
            ) : (
              <div className="grid gap-1">
                {availableTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    disabled={loading}
                    className={cn(
                      "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors text-left",
                      hasTag(tag.id) 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-muted"
                    )}
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1 truncate">{tag.name}</span>
                    {hasTag(tag.id) && <Check className="h-4 w-4 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  // Full display with visible tags
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {tags.slice(0, 2).map((tag) => (
        <Badge
          key={tag.id}
          variant="secondary"
          className="text-[9px] px-1.5 py-0 h-4"
          style={{
            backgroundColor: `${tag.color}20`,
            color: tag.color,
            borderColor: `${tag.color}40`,
          }}
        >
          {tag.name}
        </Badge>
      ))}
      
      {tags.length > 2 && (
        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4">
          +{tags.length - 2}
        </Badge>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 rounded-full hover:bg-muted"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-56 p-2">
          <div className="grid gap-1">
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                disabled={loading}
                className={cn(
                  "flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-sm transition-colors text-left",
                  hasTag(tag.id) ? "bg-primary/10" : "hover:bg-muted"
                )}
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="flex-1 truncate">{tag.name}</span>
                {hasTag(tag.id) && <Check className="h-4 w-4 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
