import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  StickyNote, 
  Plus, 
  Clock, 
  Trash2, 
  Save,
  Edit2,
  Loader2 
} from "lucide-react";

interface LessonNote {
  id: string;
  content: string;
  timestamp_seconds: number | null;
  created_at: string;
  updated_at: string;
}

interface LessonNotesProps {
  lessonId: string;
  currentTime?: number;
}

export function LessonNotes({ lessonId, currentTime = 0 }: LessonNotesProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<LessonNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [includeTimestamp, setIncludeTimestamp] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, [lessonId, user]);

  const fetchNotes = async () => {
    if (!lessonId || !user) return;
    
    const { data } = await supabase
      .from("lesson_notes")
      .select("*")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .order("created_at", { ascending: false });

    if (data) setNotes(data);
    setLoading(false);
  };

  const formatTimestamp = (seconds: number | null) => {
    if (seconds === null) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !user) return;
    setSaving(true);

    try {
      const { data, error } = await supabase.from("lesson_notes").insert({
        user_id: user.id,
        lesson_id: lessonId,
        content: newNote.trim(),
        timestamp_seconds: includeTimestamp ? Math.floor(currentTime) : null
      }).select().single();

      if (error) throw error;

      setNotes(prev => [data, ...prev]);
      setNewNote("");
      toast.success("Nota salva!");
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Erro ao salvar nota");
    } finally {
      setSaving(false);
    }
  };

  const handleEditNote = async (noteId: string) => {
    if (!editContent.trim()) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("lesson_notes")
        .update({ content: editContent.trim() })
        .eq("id", noteId);

      if (error) throw error;

      setNotes(prev => 
        prev.map(n => n.id === noteId ? { ...n, content: editContent.trim() } : n)
      );
      setEditingId(null);
      toast.success("Nota atualizada!");
    } catch (error) {
      console.error("Error updating note:", error);
      toast.error("Erro ao atualizar nota");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from("lesson_notes")
        .delete()
        .eq("id", noteId);

      if (error) throw error;

      setNotes(prev => prev.filter(n => n.id !== noteId));
      toast.success("Nota excluída");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Erro ao excluir nota");
    }
  };

  const startEdit = (note: LessonNote) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  return (
    <Card className="bg-zinc-900 border-secondary/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-cream">
          <StickyNote className="w-5 h-5 text-secondary" />
          Minhas Anotações
          {notes.length > 0 && (
            <span className="ml-2 text-sm font-normal text-cream/60">
              ({notes.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* New Note Input */}
        <div className="space-y-3">
          <Textarea
            placeholder="Adicione uma anotação sobre esta aula..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="min-h-[80px] bg-zinc-800 border-secondary/20 text-cream placeholder:text-cream/40 resize-none"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-cream/60 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTimestamp}
                onChange={(e) => setIncludeTimestamp(e.target.checked)}
                className="rounded border-secondary/30 bg-zinc-800 text-secondary focus:ring-secondary"
              />
              <Clock className="w-4 h-4" />
              Incluir timestamp ({formatTimestamp(Math.floor(currentTime))})
            </label>
            <Button
              onClick={handleAddNote}
              disabled={!newNote.trim() || saving}
              size="sm"
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Notes List */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-secondary" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8">
            <StickyNote className="w-10 h-10 text-cream/30 mx-auto mb-2" />
            <p className="text-cream/50 text-sm">
              Você ainda não fez anotações nesta aula
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            <AnimatePresence>
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 rounded-xl bg-zinc-800/50 border border-secondary/10 group"
                >
                  {editingId === note.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-[60px] bg-zinc-900 border-secondary/20 text-cream resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(null)}
                          className="text-cream/70 hover:text-cream"
                        >
                          Cancelar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleEditNote(note.id)}
                          disabled={saving}
                          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                          Salvar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {note.timestamp_seconds !== null && (
                        <span className="inline-flex items-center gap-1 text-xs text-secondary font-mono mb-2 bg-secondary/10 px-2 py-1 rounded">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(note.timestamp_seconds)}
                        </span>
                      )}
                      <p className="text-cream/80 text-sm whitespace-pre-wrap">
                        {note.content}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-cream/40">
                          {new Date(note.created_at).toLocaleDateString('pt-BR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-cream/50 hover:text-cream"
                            onClick={() => startEdit(note)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-400/50 hover:text-red-400"
                            onClick={() => handleDeleteNote(note.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
