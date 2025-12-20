import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Target, Loader2 } from "lucide-react";

interface Course {
  id: string;
  title: string;
  price: number | null;
}

interface LeadConversionDialogProps {
  open: boolean;
  onClose: () => void;
  leadId: string | null;
  leadName: string;
  onConversionComplete: () => void;
}

export function LeadConversionDialog({
  open,
  onClose,
  leadId,
  leadName,
  onConversionComplete,
}: LeadConversionDialogProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState<string>("");
  const [productName, setProductName] = useState("");
  const [revenue, setRevenue] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchCourses();
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setCourseId("");
    setProductName("");
    setRevenue("");
    setNotes("");
  };

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("id, title, price")
      .eq("is_published", true)
      .order("title");
    
    setCourses(data || []);
  };

  const handleCourseChange = (value: string) => {
    setCourseId(value);
    if (value !== "other") {
      const course = courses.find(c => c.id === value);
      if (course) {
        setProductName(course.title);
        if (course.price) {
          setRevenue(course.price.toString());
        }
      }
    } else {
      setProductName("");
      setRevenue("");
    }
  };

  const handleSave = async () => {
    if (!leadId) return;

    if (!productName.trim()) {
      toast({ title: "Informe o produto/curso", variant: "destructive" });
      return;
    }

    setSaving(true);

    try {
      // 1. Atualizar status do lead para converted
      const { error: updateError } = await supabase
        .from("leads")
        .update({ status: "converted" as const })
        .eq("id", leadId);

      if (updateError) throw updateError;

      // 2. Criar registro de conversão
      const { error: conversionError } = await supabase
        .from("lead_conversions")
        .insert({
          lead_id: leadId,
          course_id: courseId && courseId !== "other" ? courseId : null,
          product_name: productName,
          revenue: revenue ? parseFloat(revenue) : null,
          notes: notes || null,
          converted_by: user?.id || null,
        });

      if (conversionError) throw conversionError;

      toast({ title: "Conversão registrada com sucesso!" });
      onConversionComplete();
      onClose();
    } catch (error) {
      console.error("Error saving conversion:", error);
      toast({ title: "Erro ao registrar conversão", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Registrar Conversão
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Registrar conversão do lead <span className="font-medium text-foreground">{leadName}</span>
          </p>

          {/* Curso/Produto */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Produto/Curso</Label>
            <Select value={courseId} onValueChange={handleCourseChange}>
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
                <SelectItem value="other">Outro produto...</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Nome do produto (se "outro") */}
          {courseId === "other" && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Nome do Produto</Label>
              <Input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Ex: Consultoria, Mentoria..."
                className="bg-card border-border"
              />
            </div>
          )}

          {/* Valor */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Valor (R$)</Label>
            <Input
              type="number"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              placeholder="0,00"
              className="bg-card border-border"
            />
          </div>

          {/* Observações */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Observações</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalhes da conversão..."
              rows={3}
              className="bg-card border-border resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
            className="bg-card border-border text-foreground hover:bg-muted"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Target className="w-4 h-4 mr-2" />
            )}
            Registrar Conversão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
