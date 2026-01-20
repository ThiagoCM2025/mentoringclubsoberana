import { useState } from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (emoji: any) => {
    onEmojiSelect(emoji.native);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
        >
          <Smile className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0 border-0" 
        side="top" 
        align="start"
        sideOffset={8}
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
