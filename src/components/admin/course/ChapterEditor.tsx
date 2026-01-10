import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, GripVertical, Clock, BookOpen } from "lucide-react";

interface Chapter {
  id?: string;
  title: string;
  timestamp_seconds: number;
  order_index: number;
}

interface ChapterEditorProps {
  lessonId: string;
  onSave?: () => void;
}

const ChapterEditor = ({ lessonId, onSave }: ChapterEditorProps) => {
  const { toast } = useToast();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (lessonId) {
      fetchChapters();
    }
  }, [lessonId]);

  const fetchChapters = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("lesson_chapters")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("order_index");

    if (data) {
      setChapters(data);
    }
    setLoading(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseTime = (timeStr: string): number => {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      const mins = parseInt(parts[0]) || 0;
      const secs = parseInt(parts[1]) || 0;
      return mins * 60 + secs;
    }
    return parseInt(timeStr) || 0;
  };

  const addChapter = () => {
    const lastChapter = chapters[chapters.length - 1];
    const newTimestamp = lastChapter ? lastChapter.timestamp_seconds + 60 : 0;
    
    setChapters([
      ...chapters,
      {
        title: "",
        timestamp_seconds: newTimestamp,
        order_index: chapters.length
      }
    ]);
  };

  const updateChapter = (index: number, field: keyof Chapter, value: string | number) => {
    const updated = [...chapters];
    if (field === 'timestamp_seconds' && typeof value === 'string') {
      value = parseTime(value);
    }
    updated[index] = { ...updated[index], [field]: value };
    setChapters(updated);
  };

  const removeChapter = (index: number) => {
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const saveChapters = async () => {
    setSaving(true);
    try {
      // Delete existing chapters
      await supabase
        .from("lesson_chapters")
        .delete()
        .eq("lesson_id", lessonId);

      // Insert new chapters
      if (chapters.length > 0) {
        const chaptersToInsert = chapters
          .filter(c => c.title.trim())
          .map((c, index) => ({
            lesson_id: lessonId,
            title: c.title,
            timestamp_seconds: c.timestamp_seconds,
            order_index: index
          }));

        if (chaptersToInsert.length > 0) {
          const { error } = await supabase
            .from("lesson_chapters")
            .insert(chaptersToInsert);

          if (error) throw error;
        }
      }

      toast({ title: "Capítulos salvos!" });
      onSave?.();
    } catch (error) {
      console.error("Error saving chapters:", error);
      toast({ title: "Erro ao salvar capítulos", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-2 border-secondary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <Label className="text-sm font-medium">Capítulos / Timestamps</Label>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addChapter}
          className="gap-1"
        >
          <Plus className="w-3 h-3" />
          Adicionar
        </Button>
      </div>

      {chapters.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed rounded-lg">
          <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            Nenhum capítulo adicionado
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Capítulos facilitam a navegação em vídeos longos
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {chapters.map((chapter, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              
              <div className="w-20">
                <Input
                  value={formatTime(chapter.timestamp_seconds)}
                  onChange={(e) => updateChapter(index, 'timestamp_seconds', e.target.value)}
                  placeholder="0:00"
                  className="h-8 text-sm text-center font-mono"
                />
              </div>
              
              <Input
                value={chapter.title}
                onChange={(e) => updateChapter(index, 'title', e.target.value)}
                placeholder="Nome do capítulo"
                className="h-8 text-sm flex-1"
              />
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive shrink-0"
                onClick={() => removeChapter(index)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {chapters.length > 0 && (
        <Button
          type="button"
          onClick={saveChapters}
          disabled={saving}
          className="w-full bg-secondary hover:bg-secondary/90"
        >
          {saving ? "Salvando..." : "Salvar Capítulos"}
        </Button>
      )}
    </div>
  );
};

export default ChapterEditor;
