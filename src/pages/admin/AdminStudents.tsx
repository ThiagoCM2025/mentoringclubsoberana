import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { Search, Users, UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

const AdminStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data: adminRoles } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");
    
    const adminUserIds = adminRoles?.map(r => r.user_id) || [];

    const { data: profiles } = await supabase
      .from("profiles")
      .select(`id, user_id, full_name, phone, created_at`)
      .order("created_at", { ascending: false });

    if (profiles) {
      const studentsOnly = profiles.filter(p => !adminUserIds.includes(p.user_id));
      setStudents(studentsOnly);
    }
    setLoading(false);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await supabase.functions.invoke('create-student', {
        body: {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone: formData.phone || null,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao criar aluna');
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      toast({ title: "Sucesso!", description: "Aluna cadastrada com sucesso." });
      setIsDialogOpen(false);
      setFormData({ full_name: "", email: "", password: "", phone: "" });
      fetchStudents();
    } catch (error: any) {
      toast({ 
        title: "Erro", 
        description: error.message || "Não foi possível cadastrar a aluna.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.user_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              Alunos
            </h1>
            <p className="text-muted-foreground">
              Gerencie todos os alunos cadastrados
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                Nova Aluna
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Nova Aluna</DialogTitle>
                <DialogDescription>
                  Preencha os dados para criar uma nova conta de aluna.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateStudent} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nome completo *</Label>
                  <Input
                    id="full_name"
                    placeholder="Nome da aluna"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha inicial *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone (opcional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      "Cadastrar Aluna"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar alunos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="card-elegant overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aluno</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Cadastrado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">Nenhum aluno encontrado</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">
                            {student.full_name?.charAt(0)?.toUpperCase() || "A"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{student.full_name || "Sem nome"}</p>
                          <p className="text-xs text-muted-foreground">{student.user_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{student.phone || "-"}</TableCell>
                    <TableCell>
                      {new Date(student.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminStudents;