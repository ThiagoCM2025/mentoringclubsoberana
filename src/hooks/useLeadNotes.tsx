import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface LeadNote {
  id: string;
  lead_id: string;
  admin_user_id: string;
  content: string;
  action_type: string;
  created_at: string;
  admin_name?: string;
}

export function useLeadNotes(leadId: string | null) {
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchNotes = useCallback(async () => {
    if (!leadId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("lead_action_notes")
        .select("*")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch admin names
      if (data && data.length > 0) {
        const adminIds = [...new Set(data.map(n => n.admin_user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", adminIds);

        const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);
        
        setNotes(data.map(note => ({
          ...note,
          admin_name: profileMap.get(note.admin_user_id) || "Admin"
        })));
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error("Error fetching lead notes:", error);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = async (content: string, actionType: string = "note") => {
    if (!leadId || !content.trim()) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("lead_action_notes")
        .insert({
          lead_id: leadId,
          admin_user_id: user.id,
          content: content.trim(),
          action_type: actionType
        })
        .select()
        .single();

      if (error) throw error;

      // Get admin name for the new note
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      const newNote: LeadNote = {
        ...data,
        admin_name: profile?.full_name || "Você"
      };

      setNotes(prev => [newNote, ...prev]);
      
      toast({
        title: "Nota adicionada",
        description: "A nota foi salva com sucesso.",
      });

      return newNote;
    } catch (error) {
      console.error("Error adding lead note:", error);
      toast({
        title: "Erro ao adicionar nota",
        description: "Não foi possível salvar a nota.",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from("lead_action_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;

      setNotes(prev => prev.filter(n => n.id !== noteId));
      
      toast({
        title: "Nota removida",
        description: "A nota foi removida com sucesso.",
      });
    } catch (error) {
      console.error("Error deleting lead note:", error);
      toast({
        title: "Erro ao remover nota",
        description: "Não foi possível remover a nota.",
        variant: "destructive"
      });
    }
  };

  return {
    notes,
    loading,
    addNote,
    deleteNote,
    refetch: fetchNotes
  };
}
