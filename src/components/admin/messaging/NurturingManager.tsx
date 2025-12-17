import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Zap, 
  Mail, 
  Clock, 
  Save, 
  Play, 
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface NurturingSequence {
  id: string;
  step_number: number;
  name: string;
  delay_hours: number;
  email_subject: string;
  email_body: string;
  is_active: boolean;
}

export const NurturingManager = () => {
  const { toast } = useToast();
  const [sequences, setSequences] = useState<NurturingSequence[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [editingSequence, setEditingSequence] = useState<NurturingSequence | null>(null);
  const [stats, setStats] = useState({ active: 0, completed: 0, total: 0 });

  useEffect(() => {
    fetchSequences();
    fetchStats();
  }, []);

  const fetchSequences = async () => {
    const { data, error } = await supabase
      .from("nurturing_sequences")
      .select("*")
      .order("step_number");

    if (data) setSequences(data);
    if (error) console.error("Error fetching sequences:", error);
    setLoading(false);
  };

  const fetchStats = async () => {
    const { data: leads } = await supabase
      .from("leads")
      .select("nurturing_active, nurturing_step");

    if (leads) {
      setStats({
        total: leads.length,
        active: leads.filter(l => l.nurturing_active).length,
        completed: leads.filter(l => (l.nurturing_step || 0) >= 5).length,
      });
    }
  };

  const updateSequence = async (id: string, updates: Partial<NurturingSequence>) => {
    setSaving(id);
    const { error } = await supabase
      .from("nurturing_sequences")
      .update(updates)
      .eq("id", id);

    setSaving(null);
    if (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } else {
      toast({ title: "Sequência atualizada!" });
      fetchSequences();
    }
  };

  const runNurturing = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-nurturing-email");
      
      if (error) throw error;
      
      toast({
        title: "Nurturing executado!",
        description: data.message,
      });
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Erro ao executar nurturing",
        description: error.message,
        variant: "destructive",
      });
    }
    setRunning(false);
  };

  const getStepColor = (step: number) => {
    const colors = [
      "bg-blue-100 text-blue-700 border-blue-200",
      "bg-purple-100 text-purple-700 border-purple-200",
      "bg-orange-100 text-orange-700 border-orange-200",
      "bg-pink-100 text-pink-700 border-pink-200",
      "bg-green-100 text-green-700 border-green-200",
    ];
    return colors[step - 1] || colors[0];
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Leads em nurturing</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-sm text-muted-foreground">Sequências completas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-secondary/10">
                <Mail className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sequences.filter(s => s.is_active).length}</p>
                <p className="text-sm text-muted-foreground">Etapas ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Button 
              className="w-full h-full min-h-[60px]" 
              onClick={runNurturing}
              disabled={running}
            >
              {running ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Executar Nurturing
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sequences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Sequência de Nurturing
          </CardTitle>
          <CardDescription>
            Configure a sequência automática de emails para novos leads. Use {"{{name}}"} para inserir o nome do lead.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sequences.map((seq) => (
            <div 
              key={seq.id} 
              className={`p-4 rounded-lg border transition-all ${
                seq.is_active ? "bg-card" : "bg-muted/50 opacity-60"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Step Badge */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getStepColor(seq.step_number)}`}>
                  {seq.step_number}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{seq.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {seq.delay_hours}h após anterior
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${seq.id}`} className="text-sm text-muted-foreground">
                        Ativo
                      </Label>
                      <Switch
                        id={`active-${seq.id}`}
                        checked={seq.is_active}
                        onCheckedChange={(checked) => updateSequence(seq.id, { is_active: checked })}
                      />
                    </div>
                  </div>

                  {editingSequence?.id === seq.id ? (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Nome da etapa</Label>
                          <Input
                            value={editingSequence.name}
                            onChange={(e) => setEditingSequence({ ...editingSequence, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label>Delay (horas)</Label>
                          <Input
                            type="number"
                            value={editingSequence.delay_hours}
                            onChange={(e) => setEditingSequence({ ...editingSequence, delay_hours: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Assunto do email</Label>
                        <Input
                          value={editingSequence.email_subject}
                          onChange={(e) => setEditingSequence({ ...editingSequence, email_subject: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Corpo do email</Label>
                        <Textarea
                          value={editingSequence.email_body}
                          onChange={(e) => setEditingSequence({ ...editingSequence, email_body: e.target.value })}
                          rows={5}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            updateSequence(seq.id, {
                              name: editingSequence.name,
                              delay_hours: editingSequence.delay_hours,
                              email_subject: editingSequence.email_subject,
                              email_body: editingSequence.email_body,
                            });
                            setEditingSequence(null);
                          }}
                          disabled={saving === seq.id}
                        >
                          <Save className="w-4 h-4 mr-1" />
                          {saving === seq.id ? "Salvando..." : "Salvar"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingSequence(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="cursor-pointer hover:bg-muted/50 p-2 rounded-md -mx-2 transition-colors"
                      onClick={() => setEditingSequence(seq)}
                    >
                      <p className="font-medium text-sm">{seq.email_subject}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {seq.email_body}
                      </p>
                      <p className="text-xs text-primary mt-2">Clique para editar</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Como funciona o nurturing automático:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Novos leads recebem o primeiro email após o delay configurado</li>
                <li>Cada etapa é enviada automaticamente após o tempo definido</li>
                <li>Leads marcados como "converted" ou "lost" param de receber</li>
                <li>Use o botão "Executar Nurturing" para processar manualmente ou configure um cron</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
