import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Trash2, MessageSquare, Phone, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeadNotes, LeadNote } from "@/hooks/useLeadNotes";
import { cn } from "@/lib/utils";

interface LeadActionNotesProps {
  leadId: string;
}

const actionTypes = [
  { value: "note", label: "Nota", icon: FileText },
  { value: "call", label: "Ligação", icon: Phone },
  { value: "meeting", label: "Reunião", icon: Calendar },
  { value: "message", label: "Mensagem", icon: MessageSquare },
];

const getActionIcon = (actionType: string) => {
  const action = actionTypes.find(a => a.value === actionType);
  return action?.icon || FileText;
};

export function LeadActionNotes({ leadId }: LeadActionNotesProps) {
  const { notes, loading, addNote, deleteNote } = useLeadNotes(leadId);
  const [newNote, setNewNote] = useState("");
  const [actionType, setActionType] = useState("note");
  const [submitting, setSubmitting] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    setSubmitting(true);
    const result = await addNote(newNote, actionType);
    if (result) {
      setNewNote("");
      setActionType("note");
    }
    setSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleAddNote();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Notas de Ações
        </h4>
        <span className="text-xs text-muted-foreground">
          {notes.length} nota{notes.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Add new note */}
      <div className="space-y-2 p-3 bg-muted/30 rounded-lg border">
        <div className="flex gap-2">
          <Select value={actionType} onValueChange={setActionType}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {actionTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <div className="flex items-center gap-2">
                    <type.icon className="h-3 w-3" />
                    {type.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Textarea
          placeholder="Digite uma nota... (Ctrl+Enter para salvar)"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          className="text-sm resize-none"
        />
        
        <Button 
          size="sm" 
          onClick={handleAddNote}
          disabled={!newNote.trim() || submitting}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-1" />
          {submitting ? "Salvando..." : "Adicionar Nota"}
        </Button>
      </div>

      {/* Notes list */}
      <ScrollArea className="h-[200px]">
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Carregando notas...
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Nenhuma nota registrada
            </div>
          ) : (
            notes.map((note) => (
              <NoteCard key={note.id} note={note} onDelete={deleteNote} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function NoteCard({ note, onDelete }: { note: LeadNote; onDelete: (id: string) => void }) {
  const ActionIcon = getActionIcon(note.action_type);
  
  return (
    <div className="group p-3 bg-background border rounded-lg hover:border-primary/30 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <ActionIcon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <span className="font-medium text-foreground">{note.admin_name}</span>
              <span>•</span>
              <span>{format(new Date(note.created_at), "dd/MM HH:mm", { locale: ptBR })}</span>
            </div>
            <p className="text-sm whitespace-pre-wrap break-words">{note.content}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={() => onDelete(note.id)}
        >
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
