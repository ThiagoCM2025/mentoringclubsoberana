import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Send, Loader2, Bell, Info, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

interface SendNotificationDialogProps {
  studentId: string;
  studentName: string;
}

export function SendNotificationDialog({ studentId, studentName }: SendNotificationDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info"
  });

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSending(true);

    try {
      const { error } = await supabase
        .from("notifications")
        .insert({
          user_id: studentId,
          title: formData.title,
          message: formData.message,
          type: formData.type,
          created_by: user.id
        });

      if (error) throw error;

      toast.success("Notificação enviada com sucesso!");
      setOpen(false);
      setFormData({ title: "", message: "", type: "info" });
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast.error("Erro ao enviar notificação");
    } finally {
      setSending(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'alert':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Bell className="h-4 w-4" />
          Enviar Notificação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar Notificação</DialogTitle>
          <DialogDescription>
            Enviar notificação para <strong>{studentName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSend} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              placeholder="Ex: Novidade no curso!"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem *</Label>
            <Textarea
              id="message"
              placeholder="Escreva sua mensagem aqui..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Notificação</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">
                  <div className="flex items-center gap-2">
                    {getTypeIcon('info')}
                    <span>Informação</span>
                  </div>
                </SelectItem>
                <SelectItem value="success">
                  <div className="flex items-center gap-2">
                    {getTypeIcon('success')}
                    <span>Sucesso</span>
                  </div>
                </SelectItem>
                <SelectItem value="warning">
                  <div className="flex items-center gap-2">
                    {getTypeIcon('warning')}
                    <span>Aviso</span>
                  </div>
                </SelectItem>
                <SelectItem value="alert">
                  <div className="flex items-center gap-2">
                    {getTypeIcon('alert')}
                    <span>Alerta</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={sending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={sending}>
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Notificação
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
