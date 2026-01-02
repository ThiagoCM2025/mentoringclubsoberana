import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { supabase } from "@/integrations/supabase/client";
import { TagBadge } from "./TagBadge";
import { Check, Plus, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminTag {
  id: string;
  name: string;
  color: string;
  entity_type: string;
}

interface TagPickerProps {
  entityId: string;
  entityType: "student" | "lead" | "course";
  onTagsChange?: (tags: AdminTag[]) => void;
}

export const TagPicker = ({ entityId, entityType, onTagsChange }: TagPickerProps) => {
  const [open, setOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<AdminTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<AdminTag[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTags();
  }, [entityId, entityType]);

  const fetchTags = async () => {
    setLoading(true);
    try {
      // Fetch available tags for this entity type
      const { data: allTags } = await supabase
        .from("admin_tags")
        .select("*")
        .eq("entity_type", entityType)
        .order("name");

      // Fetch tags already assigned to this entity
      const { data: entityTags } = await supabase
        .from("entity_tags")
        .select("tag_id, admin_tags(*)")
        .eq("entity_id", entityId)
        .eq("entity_type", entityType);

      setAvailableTags(allTags || []);
      
      const assignedTags = entityTags?.map((et: any) => et.admin_tags).filter(Boolean) || [];
      setSelectedTags(assignedTags);
      onTagsChange?.(assignedTags);
    } catch (error) {
      console.error("Error fetching tags:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = async (tag: AdminTag) => {
    const isSelected = selectedTags.some((t) => t.id === tag.id);

    try {
      if (isSelected) {
        // Remove tag
        await supabase
          .from("entity_tags")
          .delete()
          .eq("tag_id", tag.id)
          .eq("entity_id", entityId)
          .eq("entity_type", entityType);

        const newTags = selectedTags.filter((t) => t.id !== tag.id);
        setSelectedTags(newTags);
        onTagsChange?.(newTags);
      } else {
        // Add tag
        await supabase.from("entity_tags").insert({
          tag_id: tag.id,
          entity_id: entityId,
          entity_type: entityType,
        });

        const newTags = [...selectedTags, tag];
        setSelectedTags(newTags);
        onTagsChange?.(newTags);
      }
    } catch (error) {
      console.error("Error toggling tag:", error);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1">
      {selectedTags.map((tag) => (
        <TagBadge
          key={tag.id}
          name={tag.name}
          color={tag.color}
          size="sm"
          onRemove={() => toggleTag(tag)}
        />
      ))}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar tag..." />
            <CommandList>
              <CommandEmpty>Nenhuma tag encontrada.</CommandEmpty>
              <CommandGroup>
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.some((t) => t.id === tag.id);
                  return (
                    <CommandItem
                      key={tag.id}
                      value={tag.name}
                      onSelect={() => toggleTag(tag)}
                    >
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="flex-1">{tag.name}</span>
                      {isSelected && <Check className="w-4 h-4" />}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
