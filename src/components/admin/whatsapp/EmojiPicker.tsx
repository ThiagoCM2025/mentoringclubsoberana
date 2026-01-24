import { useState } from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

export function EmojiPicker({ onEmojiSelect, className }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleSelect = (emoji: any) => {
    onEmojiSelect(emoji.native);
    setOpen(false);
  };

  const triggerButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "h-10 w-10 rounded-full text-muted-foreground touch-target",
        "hover:text-amber-500 hover:bg-amber-500/10",
        "hover:scale-105 active:scale-95",
        "transition-all duration-200",
        open && "text-amber-500 bg-amber-500/10",
        className
      )}
    >
      <Smile className="h-5 w-5" />
    </Button>
  );

  // Mobile: Use Drawer (bottom sheet)
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {triggerButton}
        </DrawerTrigger>
        <DrawerContent className="max-h-[55vh]">
          <div className="overflow-hidden rounded-t-xl">
            <Picker
              data={data}
              onEmojiSelect={handleSelect}
              theme="light"
              locale="pt"
              previewPosition="none"
              skinTonePosition="none"
              maxFrequentRows={1}
              perLine={8}
              navPosition="bottom"
              searchPosition="none"
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Use Popover
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            {triggerButton}
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
