import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ConversationTag {
  id: string;
  name: string;
  color: string;
}

export function useConversationTags(conversationId: string | null) {
  const [tags, setTags] = useState<ConversationTag[]>([]);
  const [availableTags, setAvailableTags] = useState<ConversationTag[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch available tags for conversations
  const fetchAvailableTags = useCallback(async () => {
    const { data, error } = await supabase
      .from("admin_tags")
      .select("id, name, color")
      .eq("entity_type", "conversation")
      .order("name");

    if (error) {
      console.error("Error fetching available tags:", error);
      return;
    }

    setAvailableTags(data || []);
  }, []);

  // Fetch tags assigned to current conversation
  const fetchConversationTags = useCallback(async () => {
    if (!conversationId) {
      setTags([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("entity_tags")
        .select(`
          tag_id,
          admin_tags (
            id,
            name,
            color
          )
        `)
        .eq("entity_id", conversationId)
        .eq("entity_type", "conversation");

      if (error) throw error;

      const mappedTags = (data || [])
        .filter((et) => et.admin_tags)
        .map((et) => ({
          id: (et.admin_tags as any).id,
          name: (et.admin_tags as any).name,
          color: (et.admin_tags as any).color,
        }));

      setTags(mappedTags);
    } catch (error) {
      console.error("Error fetching conversation tags:", error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  // Add tag to conversation
  const addTag = useCallback(async (tagId: string) => {
    if (!conversationId) return;

    try {
      const { error } = await supabase.from("entity_tags").insert({
        entity_id: conversationId,
        entity_type: "conversation",
        tag_id: tagId,
      });

      if (error) throw error;

      // Update local state
      const tag = availableTags.find((t) => t.id === tagId);
      if (tag) {
        setTags((prev) => [...prev, tag]);
      }
    } catch (error) {
      console.error("Error adding tag:", error);
      toast.error("Erro ao adicionar tag");
    }
  }, [conversationId, availableTags]);

  // Remove tag from conversation
  const removeTag = useCallback(async (tagId: string) => {
    if (!conversationId) return;

    try {
      const { error } = await supabase
        .from("entity_tags")
        .delete()
        .eq("entity_id", conversationId)
        .eq("entity_type", "conversation")
        .eq("tag_id", tagId);

      if (error) throw error;

      setTags((prev) => prev.filter((t) => t.id !== tagId));
    } catch (error) {
      console.error("Error removing tag:", error);
      toast.error("Erro ao remover tag");
    }
  }, [conversationId]);

  // Toggle tag
  const toggleTag = useCallback(async (tagId: string) => {
    const hasTag = tags.some((t) => t.id === tagId);
    if (hasTag) {
      await removeTag(tagId);
    } else {
      await addTag(tagId);
    }
  }, [tags, addTag, removeTag]);

  useEffect(() => {
    fetchAvailableTags();
  }, [fetchAvailableTags]);

  useEffect(() => {
    fetchConversationTags();
  }, [fetchConversationTags]);

  return {
    tags,
    availableTags,
    loading,
    addTag,
    removeTag,
    toggleTag,
    refetch: fetchConversationTags,
  };
}

// Hook to fetch tags for multiple conversations at once
export function useConversationTagsBatch(conversationIds: string[]) {
  const [tagsMap, setTagsMap] = useState<Record<string, ConversationTag[]>>({});
  const [loading, setLoading] = useState(false);

  const fetchAllTags = useCallback(async () => {
    if (conversationIds.length === 0) {
      setTagsMap({});
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("entity_tags")
        .select(`
          entity_id,
          tag_id,
          admin_tags (
            id,
            name,
            color
          )
        `)
        .eq("entity_type", "conversation")
        .in("entity_id", conversationIds);

      if (error) throw error;

      const newTagsMap: Record<string, ConversationTag[]> = {};
      
      for (const id of conversationIds) {
        newTagsMap[id] = [];
      }

      for (const item of data || []) {
        if (item.admin_tags && item.entity_id) {
          if (!newTagsMap[item.entity_id]) {
            newTagsMap[item.entity_id] = [];
          }
          newTagsMap[item.entity_id].push({
            id: (item.admin_tags as any).id,
            name: (item.admin_tags as any).name,
            color: (item.admin_tags as any).color,
          });
        }
      }

      setTagsMap(newTagsMap);
    } catch (error) {
      console.error("Error fetching conversation tags batch:", error);
    } finally {
      setLoading(false);
    }
  }, [conversationIds.join(",")]);

  useEffect(() => {
    fetchAllTags();
  }, [fetchAllTags]);

  return { tagsMap, loading, refetch: fetchAllTags };
}
