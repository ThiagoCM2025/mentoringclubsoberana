import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Edit2, Tag } from "lucide-react";
import { TagBadge } from "./TagBadge";

interface AdminTag {
  id: string;
  name: string;
  color: string;
  entity_type: string;
}

const PRESET_COLORS = [
  "#EF4444", // red
  "#F97316", // orange
  "#EAB308", // yellow
  "#22C55E", // green
  "#3B82F6", // blue
  "#8B5CF6", // purple
  "#EC4899", // pink
  "#6B7280", // gray
];

interface TagManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TagManager = ({ open, onOpenChange }: TagManagerProps) => {
  const [tags, setTags] = useState<AdminTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTag, setEditingTag] = useState<AdminTag | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    color: PRESET_COLORS[0],
    entity_type: "student" as "student" | "lead" | "course",
  });

  useEffect(() => {
    if (open) {
      fetchTags();
    }
  }, [open]);

  const fetchTags = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_tags")
      .select("*")
      .order("entity_type")
      .order("name");

    if (error) {
      toast.error("Erro ao carregar tags");
    } else {
      setTags(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Nome é obrigatório");
      return;
    }

    try {
      if (editingTag) {
        const { error } = await supabase
          .from("admin_tags")
          .update({
            name: formData.name,
            color: formData.color,
          })
          .eq("id", editingTag.id);

        if (error) throw error;
        toast.success("Tag atualizada!");
      } else {
        const { error } = await supabase.from("admin_tags").insert({
          name: formData.name,
          color: formData.color,
          entity_type: formData.entity_type,
        });

        if (error) throw error;
        toast.success("Tag criada!");
      }

      setShowForm(false);
      setEditingTag(null);
      setFormData({ name: "", color: PRESET_COLORS[0], entity_type: "student" });
      fetchTags();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar tag");
    }
  };

  const handleDelete = async (tag: AdminTag) => {
    if (!confirm(`Excluir a tag "${tag.name}"?`)) return;

    try {
      const { error } = await supabase.from("admin_tags").delete().eq("id", tag.id);
      if (error) throw error;
      toast.success("Tag excluída");
      fetchTags();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir tag");
    }
  };

  const startEdit = (tag: AdminTag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color,
      entity_type: tag.entity_type as "student" | "lead" | "course",
    });
    setShowForm(true);
  };

  const groupedTags = {
    student: tags.filter((t) => t.entity_type === "student"),
    lead: tags.filter((t) => t.entity_type === "lead"),
    course: tags.filter((t) => t.entity_type === "course"),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Gerenciar Tags
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {showForm ? (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
              <div className="space-y-2">
                <Label>Nome da Tag</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: VIP, Urgente..."
                />
              </div>

              {!editingTag && (
                <div className="space-y-2">
                  <Label>Tipo de Entidade</Label>
                  <Select
                    value={formData.entity_type}
                    onValueChange={(v) => setFormData({ ...formData, entity_type: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Alunas</SelectItem>
                      <SelectItem value="lead">Leads</SelectItem>
                      <SelectItem value="course">Cursos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Cor</Label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? "border-foreground" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setShowForm(false);
                  setEditingTag(null);
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit}>
                  {editingTag ? "Atualizar" : "Criar Tag"}
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowForm(true)} variant="outline" className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Nova Tag
            </Button>
          )}

          {/* Tags List */}
          <div className="space-y-4">
            {(["student", "lead", "course"] as const).map((type) => (
              <div key={type}>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">
                  {type === "student" ? "Alunas" : type === "lead" ? "Leads" : "Cursos"}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {groupedTags[type].length === 0 ? (
                    <span className="text-sm text-muted-foreground">Nenhuma tag</span>
                  ) : (
                    groupedTags[type].map((tag) => (
                      <div key={tag.id} className="flex items-center gap-1">
                        <TagBadge name={tag.name} color={tag.color} />
                        <button
                          onClick={() => startEdit(tag)}
                          className="p-1 text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(tag)}
                          className="p-1 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
