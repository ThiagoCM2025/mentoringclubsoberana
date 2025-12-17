import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const formSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  can_manage_courses: z.boolean().default(false),
  can_manage_students: z.boolean().default(false),
  can_manage_enrollments: z.boolean().default(false),
  can_manage_leads: z.boolean().default(false),
  can_view_reports: z.boolean().default(false),
  can_send_notifications: z.boolean().default(false),
  can_manage_admins: z.boolean().default(false),
});

type FormData = z.infer<typeof formSchema>;

interface AdminUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const permissionOptions = [
  {
    id: "can_manage_courses",
    label: "Gerenciar Cursos",
    description: "Criar, editar e excluir cursos, módulos e aulas",
  },
  {
    id: "can_manage_students",
    label: "Gerenciar Alunos",
    description: "Ver perfis, enviar notificações individuais",
  },
  {
    id: "can_manage_enrollments",
    label: "Gerenciar Matrículas",
    description: "Matricular e desmatricular alunos",
  },
  {
    id: "can_manage_leads",
    label: "Gerenciar Leads (CRM)",
    description: "Ver e editar leads, atualizar status",
  },
  {
    id: "can_view_reports",
    label: "Ver Relatórios",
    description: "Acessar dashboard e analytics",
  },
  {
    id: "can_send_notifications",
    label: "Enviar Notificações em Massa",
    description: "Enviar notificações para turmas inteiras",
  },
  {
    id: "can_manage_admins",
    label: "Gerenciar Administradores (Super Admin)",
    description: "Criar, editar e remover outros administradores",
  },
] as const;

export function AdminUserDialog({ open, onOpenChange, onSuccess }: AdminUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      can_manage_courses: false,
      can_manage_students: false,
      can_manage_enrollments: false,
      can_manage_leads: false,
      can_view_reports: false,
      can_send_notifications: false,
      can_manage_admins: false,
    },
  });

  async function onSubmit(data: FormData) {
    setIsSubmitting(true);
    try {
      const { data: response, error } = await supabase.functions.invoke("create-admin", {
        body: {
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          permissions: {
            can_manage_courses: data.can_manage_courses,
            can_manage_students: data.can_manage_students,
            can_manage_enrollments: data.can_manage_enrollments,
            can_manage_leads: data.can_manage_leads,
            can_view_reports: data.can_view_reports,
            can_send_notifications: data.can_send_notifications,
            can_manage_admins: data.can_manage_admins,
          },
        },
      });

      if (error) throw error;
      if (response?.error) throw new Error(response.error);

      toast.success("Administrador criado com sucesso!");
      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error creating admin:", error);
      toast.error(error.message || "Erro ao criar administrador");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Administrador</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Maria Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="admin@exemplo.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha inicial</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormDescription>
                    O administrador poderá alterar a senha após o primeiro login
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <h4 className="font-medium text-sm text-foreground border-b pb-2">
                Permissões de Acesso
              </h4>

              {permissionOptions.map((permission) => (
                <FormField
                  key={permission.id}
                  control={form.control}
                  name={permission.id}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          {permission.label}
                        </FormLabel>
                        <FormDescription>
                          {permission.description}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar Administrador
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
