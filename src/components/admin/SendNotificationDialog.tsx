import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Send, Loader2, Bell, Info, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { TemplateSelector } from "./TemplateSelector";

const formSchema = z.object({
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres").max(200),
  message: z.string().min(5, "Mensagem deve ter pelo menos 5 caracteres").max(1000),
  type: z.enum(["info", "success", "warning", "alert"]),
});

type FormData = z.infer<typeof formSchema>;

interface SendNotificationDialogProps {
  studentId: string;
  studentName: string;
}

export function SendNotificationDialog({ studentId, studentName }: SendNotificationDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      message: "",
      type: "info",
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!user) return;

    setSending(true);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from("notifications")
        .insert({
          user_id: studentId,
          title: data.title,
          message: data.message,
          type: data.type,
          created_by: user.id
        });

      if (error) throw error;

      setSuccess(true);
      toast.success("Notificação enviada com sucesso!");
      setTimeout(() => {
        setOpen(false);
        form.reset();
        setSuccess(false);
      }, 500);
    } catch (error: any) {
      console.error("Error sending notification:", error);
      toast.error("Erro ao enviar notificação");
    } finally {
      setSending(false);
    }
  };

  const handleTemplateSelect = (template: { title: string; message: string; type: string } | null) => {
    if (template) {
      form.setValue("title", template.title);
      form.setValue("message", template.message);
      form.setValue("type", template.type as FormData["type"]);
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
      <DialogContent className="max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Enviar Notificação</DialogTitle>
          <DialogDescription>
            Enviar notificação para <strong>{studentName}</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0 overflow-hidden mt-4">
            <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
              <TemplateSelector onSelect={handleTemplateSelect} />

              <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Novidade no curso!" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mensagem *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Escreva sua mensagem aqui..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Notificação</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />
            </div>

            <div className="flex-shrink-0 flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={sending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={sending} className="min-w-[160px]">
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" />
                    Enviado!
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
        </Form>
      </DialogContent>
    </Dialog>
  );
}