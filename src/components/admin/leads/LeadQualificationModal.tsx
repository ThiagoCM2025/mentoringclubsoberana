import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, X, Check } from "lucide-react";

const PAIN_POINTS_OPTIONS = [
  "Dificuldade em captar clientes",
  "Não sabe precificar honorários",
  "Falta de posicionamento digital",
  "Agenda vazia / poucos processos",
  "Não consegue fechar contratos",
  "Trabalha muito e ganha pouco",
  "Falta de autoridade no mercado",
  "Dificuldade em redes sociais",
];

const PRACTICE_AREAS = [
  "Imobiliário",
  "Família",
  "Criminal",
  "Trabalhista",
  "Tributário",
  "Empresarial",
  "Consumidor",
  "Previdenciário",
  "Cível",
  "Outro",
];

const INVESTMENT_RANGES = [
  "Até R$ 500",
  "R$ 500 - R$ 1.000",
  "R$ 1.000 - R$ 3.000",
  "R$ 3.000 - R$ 5.000",
  "Acima de R$ 5.000",
];

interface LeadQualificationModalProps {
  open: boolean;
  onClose: () => void;
  leadId: string | null;
  leadName: string;
  onQualificationComplete: () => void;
}

export function LeadQualificationModal({
  open,
  onClose,
  leadId,
  leadName,
  onQualificationComplete,
}: LeadQualificationModalProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [painPoints, setPainPoints] = useState<string[]>([]);
  const [mentoringGoals, setMentoringGoals] = useState("");
  const [practiceArea, setPracticeArea] = useState("");
  const [productInterest, setProductInterest] = useState("");
  const [investmentRange, setInvestmentRange] = useState("");
  const [products, setProducts] = useState<{ id: string; title: string }[]>([]);

  // Fetch products when modal opens
  useState(() => {
    supabase
      .from("courses")
      .select("id, title")
      .eq("is_published", true)
      .then(({ data }) => {
        if (data) setProducts(data);
      });
  });

  const togglePainPoint = (point: string) => {
    setPainPoints((prev) =>
      prev.includes(point) ? prev.filter((p) => p !== point) : [...prev, point]
    );
  };

  const handleSave = async () => {
    if (!leadId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("leads")
        .update({
          status: "qualified",
          pain_points: painPoints.length > 0 ? painPoints : null,
          mentoring_goals: mentoringGoals || null,
          practice_area: practiceArea || null,
          product_interest: productInterest || null,
          investment_range: investmentRange || null,
          last_contact_at: new Date().toISOString(),
        })
        .eq("id", leadId);

      if (error) throw error;

      toast({ title: "Lead qualificado com sucesso!" });
      onQualificationComplete();
      resetAndClose();
    } catch (error) {
      console.error("Error qualifying lead:", error);
      toast({ title: "Erro ao qualificar lead", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const resetAndClose = () => {
    setPainPoints([]);
    setMentoringGoals("");
    setPracticeArea("");
    setProductInterest("");
    setInvestmentRange("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col overflow-hidden bg-card border-border">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg font-semibold">
            Qualificar Lead: {leadName}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-2 pr-1">
          {/* Pain Points */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Dores do Lead</Label>
            <div className="flex flex-wrap gap-2">
              {PAIN_POINTS_OPTIONS.map((point) => (
                <Badge
                  key={point}
                  variant={painPoints.includes(point) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    painPoints.includes(point)
                      ? "bg-secondary text-secondary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => togglePainPoint(point)}
                >
                  {painPoints.includes(point) && (
                    <Check className="w-3 h-3 mr-1" />
                  )}
                  {point}
                </Badge>
              ))}
            </div>
          </div>

          {/* Mentoring Goals */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">O que busca com a Mentoria?</Label>
            <Textarea
              value={mentoringGoals}
              onChange={(e) => setMentoringGoals(e.target.value)}
              placeholder="Descreva os objetivos do lead..."
              className="min-h-[80px] bg-background border-border"
            />
          </div>

          {/* Practice Area */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Área de Atuação</Label>
            <Select value={practiceArea} onValueChange={setPracticeArea}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Selecione a área..." />
              </SelectTrigger>
              <SelectContent>
                {PRACTICE_AREAS.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Interest */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Produto de Interesse</Label>
            <Select value={productInterest} onValueChange={setProductInterest}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Selecione o produto..." />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.title}>
                    {product.title}
                  </SelectItem>
                ))}
                <SelectItem value="Indefinido">Ainda não definido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Investment Range */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Faixa de Investimento</Label>
            <Select value={investmentRange} onValueChange={setInvestmentRange}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Selecione a faixa..." />
              </SelectTrigger>
              <SelectContent>
                {INVESTMENT_RANGES.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 pt-4 border-t">
          <Button variant="outline" onClick={resetAndClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Qualificar Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
