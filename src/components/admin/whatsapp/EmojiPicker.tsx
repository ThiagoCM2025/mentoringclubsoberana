import { useState } from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { cn } from "@/lib/utils";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

export function EmojiPicker({ onEmojiSelect, className }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (emoji: any) => {
    onEmojiSelect(emoji.native);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 rounded-full text-muted-foreground",
                "hover:text-amber-500 hover:bg-amber-500/10",
                "hover:scale-110 active:scale-95",
                "transition-all duration-200",
                open && "text-amber-500 bg-amber-500/10",
                className
              )}
            >
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          Emoji
        </TooltipContent>
      </Tooltip>
      <PopoverContent 
        className="w-auto p-0 border-0 shadow-xl rounded-xl overflow-hidden" 
        side="top" 
        align="start"
        sideOffset={12}
      >
        <Picker
          data={data}
          onEmojiSelect={handleSelect}
          theme="light"
          locale="pt"
          previewPosition="none"
          skinTonePosition="search"
          maxFrequentRows={2}
          perLine={8}
        />
      </PopoverContent>
    </Popover>
  );
}
