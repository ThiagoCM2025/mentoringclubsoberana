import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { toast } from "sonner";
import { 
  Target, 
  Plus, 
  Trophy, 
  ChevronDown,
  Sparkles,
  Edit,
  Trash2,
  Wand2,
  Loader2
} from "lucide-react";
import MissionDialog from "./MissionDialog";
import MissionCard from "./MissionCard";

interface Mission {
  id: string;
  course_id: string;
  week_number: number;
  month_number: number | null;
  month_title: string | null;
  title: string;
  challenge_description: string;
  why_do: string | null;
  gamification_emoji: string | null;
  gamification_title: string | null;
  gamification_reward: string | null;
  xp_reward: number | null;
  related_lesson_id: string | null;
  requires_proof: boolean | null;
  proof_type: string | null;
  is_active: boolean | null;
}

interface Lesson {
  id: string;
  title: string;
  module_title?: string;
}

interface Module {
  id: string;
  title: string;
  lessons: { id: string; title: string }[];
}

interface CourseMissionsTabProps {
  courseId: string;
  modules: Module[];
}

const MONTH_TITLES = {
  1: "Mês 1: Fundação",
  2: "Mês 2: Conversão",
  3: "Mês 3: Escala",
};

const CourseMissionsTab = ({ courseId, modules }: CourseMissionsTabProps) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [expandedMonths, setExpandedMonths] = useState<number[]>([1, 2, 3]);
  
  // AI Generation state
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiSource, setAISource] = useState<"module" | "lesson" | "template">("template");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("");
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");

  // Flatten lessons for selection
  const allLessons: Lesson[] = modules.flatMap(m => 
    m.lessons.map(l => ({ ...l, module_title: m.title }))
  );

  useEffect(() => {
    fetchMissions();
  }, [courseId]);

  const fetchMissions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("weekly_missions")
      .select("*")
      .eq("course_id", courseId)
      .order("week_number");

    if (error) {
      toast.error("Erro ao carregar missões");
    } else {
      setMissions(data || []);
    }
    setLoading(false);
  };

  const handleEdit = (mission: Mission) => {
    setEditingMission(mission);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta missão?")) return;

    const { error } = await supabase
      .from("weekly_missions")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Erro ao excluir missão");
    } else {
      toast.success("Missão excluída");
      fetchMissions();
    }
  };

  const handleNewMission = (weekNumber?: number, monthNumber?: number) => {
    setEditingMission(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingMission(null);
  };

  const handleSaved = () => {
    fetchMissions();
    handleDialogClose();
  };

  const generateWithAI = async () => {
    setGeneratingAI(true);
    
    try {
      let context = "";
      let weekNumber = 1;
      
      if (aiSource === "module" && selectedModuleId) {
        const module = modules.find(m => m.id === selectedModuleId);
        if (module) {
          context = `Módulo: ${module.title}\nAulas: ${module.lessons.map(l => l.title).join(", ")}`;
          // Find next available week
          weekNumber = missions.length + 1;
        }
      } else if (aiSource === "lesson" && selectedLessonId) {
        const lesson = allLessons.find(l => l.id === selectedLessonId);
        if (lesson) {
          context = `Aula: ${lesson.title} (Módulo: ${lesson.module_title})`;
          weekNumber = missions.length + 1;
        }
      } else {
        // Template - generate all 12 weeks
        context = "Programa de 12 semanas para aceleração de advogadas na área imobiliária. Gerar missões progressivas.";
      }

      const { data, error } = await supabase.functions.invoke("generate-mission", {
        body: { 
          context, 
          courseId,
          weekNumber,
          generateAll: aiSource === "template"
        }
      });

      if (error) throw error;

      if (data?.missions && Array.isArray(data.missions)) {
        // Insert multiple missions
        for (const mission of data.missions) {
          await supabase.from("weekly_missions").insert({
            course_id: courseId,
            ...mission
          });
        }
        toast.success(`${data.missions.length} missões geradas com sucesso!`);
      } else if (data?.mission) {
        // Insert single mission
        await supabase.from("weekly_missions").insert({
          course_id: courseId,
          ...data.mission
        });
        toast.success("Missão gerada com sucesso!");
      }

      fetchMissions();
    } catch (error) {
      console.error("Error generating mission:", error);
      toast.error("Erro ao gerar missão com IA");
    } finally {
      setGeneratingAI(false);
    }
  };

  const toggleMonth = (month: number) => {
    setExpandedMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month) 
        : [...prev, month]
    );
  };

  // Group missions by month
  const missionsByMonth = {
    1: missions.filter(m => m.month_number === 1 || (m.week_number >= 1 && m.week_number <= 4 && !m.month_number)),
    2: missions.filter(m => m.month_number === 2 || (m.week_number >= 5 && m.week_number <= 8 && !m.month_number)),
    3: missions.filter(m => m.month_number === 3 || (m.week_number >= 9 && m.week_number <= 12 && !m.month_number)),
  };

  // Calculate total XP
  const totalXP = missions.reduce((acc, m) => acc + (m.xp_reward || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">{missions.length} missões</span>
          </div>
          <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
            <Trophy className="w-3 h-3 mr-1" />
            {totalXP} XP total
          </Badge>
        </div>
        <Button onClick={() => handleNewMission()} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Nova Missão
        </Button>
      </div>

      {/* AI Generator Section */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Gerador de Missões com IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Gerar baseado em:</Label>
              <Select value={aiSource} onValueChange={(v: "module" | "lesson" | "template") => setAISource(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="template">Template padrão (12 semanas)</SelectItem>
                  <SelectItem value="module">Módulo específico</SelectItem>
                  <SelectItem value="lesson">Aula específica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {aiSource === "module" && (
              <div className="space-y-2">
                <Label>Selecionar Módulo</Label>
                <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um módulo" />
                  </SelectTrigger>
                  <SelectContent>
                    {modules.map(module => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {aiSource === "lesson" && (
              <div className="space-y-2">
                <Label>Selecionar Aula</Label>
                <Select value={selectedLessonId} onValueChange={setSelectedLessonId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha uma aula" />
                  </SelectTrigger>
                  <SelectContent>
                    {allLessons.map(lesson => (
                      <SelectItem key={lesson.id} value={lesson.id}>
                        {lesson.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-end">
              <Button 
                onClick={generateWithAI} 
                disabled={generatingAI || (aiSource === "module" && !selectedModuleId) || (aiSource === "lesson" && !selectedLessonId)}
                className="w-full"
              >
                {generatingAI ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Gerar com IA
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline by Month */}
      <div className="space-y-4">
        {[1, 2, 3].map(month => (
          <Collapsible 
            key={month} 
            open={expandedMonths.includes(month)}
            onOpenChange={() => toggleMonth(month)}
          >
            <Card className="overflow-hidden">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg
                        ${month === 1 ? 'bg-blue-500/20 text-blue-600' : ''}
                        ${month === 2 ? 'bg-purple-500/20 text-purple-600' : ''}
                        ${month === 3 ? 'bg-amber-500/20 text-amber-600' : ''}
                      `}>
                        {month}
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {MONTH_TITLES[month as keyof typeof MONTH_TITLES]}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {missionsByMonth[month as keyof typeof missionsByMonth].length} missões • 
                          Semanas {month === 1 ? "1-4" : month === 2 ? "5-8" : "9-12"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {missionsByMonth[month as keyof typeof missionsByMonth].reduce((acc, m) => acc + (m.xp_reward || 0), 0)} XP
                      </Badge>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${expandedMonths.includes(month) ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4">
                  {missionsByMonth[month as keyof typeof missionsByMonth].length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>Nenhuma missão para este mês</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => handleNewMission((month - 1) * 4 + 1, month)}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Criar primeira missão
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {missionsByMonth[month as keyof typeof missionsByMonth]
                        .sort((a, b) => a.week_number - b.week_number)
                        .map(mission => (
                          <MissionCard
                            key={mission.id}
                            mission={mission}
                            onEdit={() => handleEdit(mission)}
                            onDelete={() => handleDelete(mission.id)}
                          />
                        ))
                      }
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {/* Mission Dialog */}
      <MissionDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleDialogClose();
          } else {
            setDialogOpen(true);
          }
        }}
        courseId={courseId}
        mission={editingMission}
        lessons={allLessons}
        onSaved={handleSaved}
      />
    </div>
  );
};

export default CourseMissionsTab;
