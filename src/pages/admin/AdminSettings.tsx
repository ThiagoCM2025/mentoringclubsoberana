import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AdminUserDialog } from "@/components/admin/AdminUserDialog";
import { usePermissions } from "@/hooks/usePermissions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Settings,
  ShieldCheck,
  Loader2,
  Trash2,
  Save,
  FileText,
} from "lucide-react";
import { NotificationTemplatesTab } from "@/components/admin/NotificationTemplatesTab";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminUser {
  user_id: string;
  email: string;
  full_name: string;
  permissions: {
    can_manage_courses: boolean;
    can_manage_students: boolean;
    can_manage_enrollments: boolean;
    can_manage_leads: boolean;
    can_view_reports: boolean;
    can_send_notifications: boolean;
    can_manage_admins: boolean;
  };
}

const permissionLabels = {
  can_manage_courses: "Cursos",
  can_manage_students: "Alunos",
  can_manage_enrollments: "Matrículas",
  can_manage_leads: "Leads",
  can_view_reports: "Relatórios",
  can_send_notifications: "Notificações",
  can_manage_admins: "Super Admin",
};

export default function AdminSettings() {
  const { canManageAdmins, loading: permLoading } = usePermissions();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewAdminDialog, setShowNewAdminDialog] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<AdminUser | null>(null);
  const [savingPermissions, setSavingPermissions] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  async function fetchAdmins() {
    setLoading(true);
    try {
      // Get all admin roles
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");

      if (rolesError) throw rolesError;

      if (!roles || roles.length === 0) {
        setAdmins([]);
        return;
      }

      const userIds = roles.map((r) => r.user_id);

      // Get profiles for admin users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Get permissions
      const { data: permissions, error: permError } = await supabase
        .from("admin_permissions")
        .select("*")
        .in("user_id", userIds);

      if (permError) console.error("Permissions error:", permError);

      // Combine data
      const adminList: AdminUser[] = roles.map((role) => {
        const profile = profiles?.find((p) => p.user_id === role.user_id);
        const perm = permissions?.find((p) => p.user_id === role.user_id);

        return {
          user_id: role.user_id,
          email: profile?.full_name || "Admin",
          full_name: profile?.full_name || "Administrador",
          permissions: {
            can_manage_courses: perm?.can_manage_courses ?? true,
            can_manage_students: perm?.can_manage_students ?? true,
            can_manage_enrollments: perm?.can_manage_enrollments ?? true,
            can_manage_leads: perm?.can_manage_leads ?? true,
            can_view_reports: perm?.can_view_reports ?? true,
            can_send_notifications: perm?.can_send_notifications ?? true,
            can_manage_admins: perm?.can_manage_admins ?? true,
          },
        };
      });

      setAdmins(adminList);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Erro ao carregar administradores");
    } finally {
      setLoading(false);
    }
  }

  async function handleSavePermissions(admin: AdminUser) {
    setSavingPermissions(true);
    try {
      const { error } = await supabase
        .from("admin_permissions")
        .upsert({
          user_id: admin.user_id,
          ...admin.permissions,
        });

      if (error) throw error;

      toast.success("Permissões atualizadas com sucesso!");
      setEditingAdmin(null);
      fetchAdmins();
    } catch (error: any) {
      console.error("Error updating permissions:", error);
      toast.error("Erro ao atualizar permissões");
    } finally {
      setSavingPermissions(false);
    }
  }

  async function handleRemoveAdmin(admin: AdminUser) {
    try {
      // Remove admin role
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", admin.user_id)
        .eq("role", "admin");

      if (error) throw error;

      // Remove permissions
      await supabase
        .from("admin_permissions")
        .delete()
        .eq("user_id", admin.user_id);

      toast.success("Administrador removido com sucesso!");
      setDeleteConfirm(null);
      fetchAdmins();
    } catch (error: any) {
      console.error("Error removing admin:", error);
      toast.error("Erro ao remover administrador");
    }
  }

  function updateEditingPermission(key: keyof AdminUser["permissions"], value: boolean) {
    if (!editingAdmin) return;
    setEditingAdmin({
      ...editingAdmin,
      permissions: {
        ...editingAdmin.permissions,
        [key]: value,
      },
    });
  }

  if (permLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 space-y-6 admin-area">
        <div className="flex items-center gap-3">
          <Settings className="w-8 h-8 text-secondary" />
          <h1 className="text-3xl font-serif font-bold text-foreground">Configurações</h1>
        </div>

        <Tabs defaultValue="admins" className="space-y-6">
          <TabsList className="bg-muted border border-border">
            <TabsTrigger value="admins" className="flex items-center gap-2 data-[state=active]:bg-secondary data-[state=active]:text-black">
              <Users className="w-4 h-4" />
              Administradores
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2 data-[state=active]:bg-secondary data-[state=active]:text-black">
              <FileText className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="general" className="flex items-center gap-2 data-[state=active]:bg-secondary data-[state=active]:text-black">
              <Settings className="w-4 h-4" />
              Geral
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admins" className="space-y-4">
            <Card className="admin-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <ShieldCheck className="w-5 h-5 text-secondary" />
                    Administradores do Sistema
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Gerencie quem tem acesso ao painel administrativo e suas permissões
                  </CardDescription>
                </div>
                {canManageAdmins && (
                  <Button onClick={() => setShowNewAdminDialog(true)} className="bg-secondary hover:bg-secondary/90 text-black btn-glow-gold">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Administrador
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : admins.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum administrador encontrado
                  </p>
                ) : (
                  <div className="space-y-4">
                    {admins.map((admin) => (
                      <div
                        key={admin.user_id}
                        className="border border-border rounded-lg p-4 space-y-3 bg-card"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-foreground">{admin.full_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              ID: {admin.user_id.slice(0, 8)}...
                            </p>
                          </div>
                          {canManageAdmins && (
                            <div className="flex gap-2">
                              {editingAdmin?.user_id === admin.user_id ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="premium"
                                    onClick={() => setEditingAdmin(null)}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="gold"
                                    onClick={() => handleSavePermissions(editingAdmin)}
                                    disabled={savingPermissions}
                                  >
                                    {savingPermissions ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Save className="w-4 h-4 mr-1" />
                                    )}
                                    Salvar
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="premium"
                                    onClick={() => setEditingAdmin(admin)}
                                  >
                                    Editar
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => setDeleteConfirm(admin)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        {editingAdmin?.user_id === admin.user_id ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-secondary/20">
                            {Object.entries(permissionLabels).map(([key, label]) => (
                              <div key={key} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${admin.user_id}-${key}`}
                                  checked={
                                    editingAdmin.permissions[
                                      key as keyof AdminUser["permissions"]
                                    ]
                                  }
                                  onCheckedChange={(checked) =>
                                    updateEditingPermission(
                                      key as keyof AdminUser["permissions"],
                                      !!checked
                                    )
                                  }
                                />
                                <Label
                                  htmlFor={`${admin.user_id}-${key}`}
                                  className="text-sm cursor-pointer text-muted-foreground"
                                >
                                  {label}
                                </Label>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(admin.permissions)
                              .filter(([_, value]) => value)
                              .map(([key]) => (
                                <Badge
                                  key={key}
                                  variant="secondary"
                                  className="text-xs bg-secondary/20 text-secondary border-secondary/30"
                                >
                                  {permissionLabels[key as keyof typeof permissionLabels]}
                                </Badge>
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <NotificationTemplatesTab />
          </TabsContent>

          <TabsContent value="general">
            <Card className="admin-card">
              <CardHeader>
                <CardTitle className="text-foreground">Configurações Gerais</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Configurações gerais da plataforma (em breve)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-center py-8">
                  Funcionalidades adicionais serão adicionadas em breve.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AdminUserDialog
        open={showNewAdminDialog}
        onOpenChange={setShowNewAdminDialog}
        onSuccess={fetchAdmins}
      />

      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Administrador?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover {deleteConfirm?.full_name} como administrador?
              Esta ação irá revogar todas as permissões de acesso ao painel administrativo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleRemoveAdmin(deleteConfirm)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
