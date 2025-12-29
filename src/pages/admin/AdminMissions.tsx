import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { motion } from "framer-motion";
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  Search,
  CheckCircle,
  Clock,
  XCircle,
  Trophy
} from "lucide-react";

interface Mission {
  id: string;
  course_id: string;
  week_number: number;
  month_number: number;
  month_title: string | null;
  title: string;
  challenge_description: string;
  why_do: string | null;
  gamification_emoji: string;
  gamification_title: string | null;
  gamification_reward: string | null;
  xp_reward: number;
  is_active: boolean;
}

interface Course {
  id: string;
  title: string;
}

const AdminMissions = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    course_id: "",
    week_number: 1,
    month_number: 1,
    month_title: "",
    title: "",
    challenge_description: "",
    why_do: "",
    gamification_emoji: "🎯",
    gamification_title: "",
    gamification_reward: "",
    xp_reward: 100
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Fetch courses with program_type
    const { data: coursesData } = await supabase
      .from("courses")
      .select("id, title")
      .not("program_type", "is", null);

    if (coursesData) {
      setCourses(coursesData);
    }

    // Fetch missions
    const { data: missionsData } = await supabase
      .from("weekly_missions")
      .select("*")
      .order("week_number");

    if (missionsData) {
      setMissions(missionsData);
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!formData.course_id || !formData.title || !formData.challenge_description) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      if (editingMission) {
        const { error } = await supabase
          .from("weekly_missions")
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq("id", editingMission.id);

        if (error) throw error;
        toast.success("Missão atualizada!");
      } else {
        const { error } = await supabase
          .from("weekly_missions")
          .insert(formData);

        if (error) throw error;
        toast.success("Missão criada!");
      }

      setDialogOpen(false);
      setEditingMission(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error("Error saving mission:", error);
      toast.error("Erro ao salvar missão");
    }
  };

  const handleEdit = (mission: Mission) => {
    setEditingMission(mission);
    setFormData({
      course_id: mission.course_id,
      week_number: mission.week_number,
      month_number: mission.month_number,
      month_title: mission.month_title || "",
      title: mission.title,
      challenge_description: mission.challenge_description,
      why_do: mission.why_do || "",
      gamification_emoji: mission.gamification_emoji,
      gamification_title: mission.gamification_title || "",
      gamification_reward: mission.gamification_reward || "",
      xp_reward: mission.xp_reward
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta missão?")) return;

    try {
      const { error } = await supabase
        .from("weekly_missions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Missão excluída");
      fetchData();
    } catch (error) {
      console.error("Error deleting mission:", error);
      toast.error("Erro ao excluir missão");
    }
  };

  const resetForm = () => {
    setFormData({
      course_id: "",
      week_number: 1,
      month_number: 1,
      month_title: "",
      title: "",
      challenge_description: "",
      why_do: "",
      gamification_emoji: "🎯",
      gamification_title: "",
      gamification_reward: "",
      xp_reward: 100
    });
  };

  const filteredMissions = missions.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = selectedCourse === "all" || m.course_id === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const getCourseTitle = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.title || "Curso não encontrado";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
              <Target className="w-6 h-6 text-primary" />
              Missões Semanais
            </h1>
            <p className="text-muted-foreground">
              Gerencie as missões dos programas estruturados
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setEditingMission(null);
              setDialogOpen(true);
            }}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Missão
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-card border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar missão..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cursos</SelectItem>
                {courses.map(course => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Table */}
        <Card className="bg-card border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Semana</TableHead>
                <TableHead>Missão</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead>XP</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredMissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhuma missão encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredMissions.map((mission) => (
                  <TableRow key={mission.id}>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {mission.gamification_emoji} S{mission.week_number}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{mission.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {mission.gamification_title}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getCourseTitle(mission.course_id)}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                        <Trophy className="w-3 h-3 mr-1" />
                        {mission.xp_reward}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={mission.is_active ? "default" : "secondary"}>
                        {mission.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(mission)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(mission.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMission ? "Editar Missão" : "Nova Missão"}
              </DialogTitle>
              <DialogDescription>
                Configure os detalhes da missão semanal
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Curso *</Label>
                  <Select
                    value={formData.course_id}
                    onValueChange={(v) => setFormData({ ...formData, course_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Semana</Label>
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      value={formData.week_number}
                      onChange={(e) => setFormData({ ...formData, week_number: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mês</Label>
                    <Input
                      type="number"
                      min={1}
                      max={3}
                      value={formData.month_number}
                      onChange={(e) => setFormData({ ...formData, month_number: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título do Mês</Label>
                  <Input
                    placeholder="Ex: Fundação e Posicionamento"
                    value={formData.month_title}
                    onChange={(e) => setFormData({ ...formData, month_title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Emoji</Label>
                  <Input
                    placeholder="🎯"
                    value={formData.gamification_emoji}
                    onChange={(e) => setFormData({ ...formData, gamification_emoji: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Título da Missão *</Label>
                <Input
                  placeholder="Missão Identidade Soberana"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Descrição do Desafio *</Label>
                <Textarea
                  placeholder="O que a aluna deve fazer..."
                  value={formData.challenge_description}
                  onChange={(e) => setFormData({ ...formData, challenge_description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Por que fazer</Label>
                <Textarea
                  placeholder="Motivo e benefícios..."
                  value={formData.why_do}
                  onChange={(e) => setFormData({ ...formData, why_do: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Título da Gamificação</Label>
                  <Input
                    placeholder="Autoridade em Construção"
                    value={formData.gamification_title}
                    onChange={(e) => setFormData({ ...formData, gamification_title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>XP de Recompensa</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.xp_reward}
                    onChange={(e) => setFormData({ ...formData, xp_reward: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Recompensa</Label>
                <Input
                  placeholder="Selo 'Pronta para o Jogo'"
                  value={formData.gamification_reward}
                  onChange={(e) => setFormData({ ...formData, gamification_reward: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                {editingMission ? "Salvar Alterações" : "Criar Missão"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminMissions;
