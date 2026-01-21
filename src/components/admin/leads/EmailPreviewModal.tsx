import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VariableInsertBar, replaceVariablesWithExamples } from "./VariableInsertBar";
import { Mail, Send, Eye, Loader2, Clock, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import isotipoGold from "@/assets/brand/isotipo-gold.png";

interface NurturingSequence {
  id: string;
  step_number: number;
  name: string;
  email_subject: string;
  email_body: string;
  delay_hours: number;
  source_filter: string | null;
  is_active: boolean;
}

interface EmailPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sequence: NurturingSequence | null;
  onSave: (sequence: NurturingSequence) => Promise<void>;
  campaignName?: string;
}

export function EmailPreviewModal({
  open,
  onOpenChange,
  sequence,
  onSave,
  campaignName,
}: EmailPreviewModalProps) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [delayHours, setDelayHours] = useState(48);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [activeField, setActiveField] = useState<"subject" | "body">("body");
  
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (sequence) {
      setName(sequence.name);
      setSubject(sequence.email_subject);
      setBody(sequence.email_body || "");
      setDelayHours(sequence.delay_hours);
    }
  }, [sequence]);

  const handleInsertVariable = (variable: string) => {
    if (activeField === "subject" && subjectRef.current) {
      const start = subjectRef.current.selectionStart || subject.length;
      const end = subjectRef.current.selectionEnd || subject.length;
      const newSubject = subject.slice(0, start) + variable + subject.slice(end);
      setSubject(newSubject);
      setTimeout(() => {
        subjectRef.current?.focus();
        subjectRef.current?.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    } else if (activeField === "body" && bodyRef.current) {
      const start = bodyRef.current.selectionStart || body.length;
      const end = bodyRef.current.selectionEnd || body.length;
      const newBody = body.slice(0, start) + variable + body.slice(end);
      setBody(newBody);
      setTimeout(() => {
        bodyRef.current?.focus();
        bodyRef.current?.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const handleSave = async () => {
    if (!sequence) return;
    
    setSaving(true);
    try {
      await onSave({
        ...sequence,
        name,
        email_subject: subject,
        email_body: body,
        delay_hours: delayHours,
      });
      toast.success("Template salvo com sucesso!");
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao salvar template");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!sequence) return;
    
    setTesting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        toast.error("Você precisa estar logado para enviar teste");
        return;
      }

      const { error } = await supabase.functions.invoke("test-nurturing-email", {
        body: {
          sequenceId: sequence.id,
          testEmail: user.email,
          subject,
          body,
        },
      });

      if (error) throw error;
      toast.success(`E-mail de teste enviado para ${user.email}`);
    } catch (error) {
      console.error("Error sending test email:", error);
      toast.error("Erro ao enviar e-mail de teste");
    } finally {
      setTesting(false);
    }
  };

  const previewSubject = replaceVariablesWithExamples(subject);
  const previewBody = replaceVariablesWithExamples(body);

  if (!sequence) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            Editar Template de E-mail
            {campaignName && (
              <Badge variant="secondary">{campaignName}</Badge>
            )}
            <Badge variant="outline" className="ml-auto">
              Etapa {sequence.step_number}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-2 gap-6 min-h-0 overflow-hidden">
          {/* Editor Column */}
          <div className="flex flex-col gap-4 overflow-y-auto pr-2 min-h-0">
            <div className="flex items-center gap-2">
              <Pencil className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Editor</span>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Etapa</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Boas-vindas"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="delay" className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    Delay (horas)
                  </Label>
                  <Input
                    id="delay"
                    type="number"
                    min={0}
                    value={delayHours}
                    onChange={(e) => setDelayHours(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Assunto do E-mail</Label>
                <Input
                  ref={subjectRef}
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  onFocus={() => setActiveField("subject")}
                  placeholder="Ex: {{nome}}, você não pode perder isso!"
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Corpo do E-mail</Label>
                <Textarea
                  ref={bodyRef}
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  onFocus={() => setActiveField("body")}
                  placeholder="Olá {{nome}},&#10;&#10;Escreva aqui o conteúdo do seu e-mail..."
                  className="min-h-[300px] font-mono text-sm resize-none"
                />
              </div>

              <VariableInsertBar onInsert={handleInsertVariable} />
            </div>
          </div>

          {/* Preview Column */}
          <div className="flex flex-col gap-4 overflow-hidden border-l pl-6 min-h-0">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Preview</span>
              <Badge variant="outline" className="text-xs">Tempo real</Badge>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Email Preview */}
              <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
                {/* Email Header */}
                <div className="bg-gradient-to-r from-[#8B7355] to-[#a08060] p-6 text-center">
                  <img 
                    src={isotipoGold} 
                    alt="Soberana" 
                    className="h-12 mx-auto mb-2 brightness-0 invert"
                  />
                  <p className="text-white/80 text-sm">Advocacia Imobiliária de Excelência</p>
                </div>

                {/* Subject Preview */}
                <div className="border-b bg-gray-50 px-6 py-3">
                  <p className="text-xs text-gray-500 mb-1">Assunto:</p>
                  <p className="font-medium text-gray-900">
                    {previewSubject || "(sem assunto)"}
                  </p>
                </div>

                {/* Body Preview */}
                <div className="p-6">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                    {previewBody || "(sem conteúdo)"}
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t bg-gray-50 px-6 py-4 text-center">
                  <p className="text-xs text-gray-500">
                    Fabiana Ferreira - Soberana Advocacia
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Este e-mail foi enviado para maria@email.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <DialogFooter className="flex-shrink-0 gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="secondary"
            onClick={handleTest}
            disabled={testing || !subject || !body}
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Testar
              </>
            )}
          </Button>
          <Button onClick={handleSave} disabled={saving || !name || !subject}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
