import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MaterialUploader from "./MaterialUploader";
import { FileText, FolderOpen } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  order_index: number;
}

interface Module {
  id: string;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

interface Material {
  id: string;
  title: string;
  file_url: string;
  file_type: string | null;
}

interface CourseMaterialsTabProps {
  modules: Module[];
}

const CourseMaterialsTab = ({ modules }: CourseMaterialsTabProps) => {
  const [selectedLesson, setSelectedLesson] = useState<string>("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedLesson) {
      fetchMaterials();
    } else {
      setMaterials([]);
    }
  }, [selectedLesson]);

  const fetchMaterials = async () => {
    if (!selectedLesson) return;
    
    setLoading(true);
    const { data } = await supabase
      .from("lesson_materials")
      .select("*")
      .eq("lesson_id", selectedLesson)
      .order("created_at");

    if (data) setMaterials(data);
    setLoading(false);
  };

  // Get all lessons flat with module info
  const allLessons = modules.flatMap((module, moduleIndex) =>
    module.lessons.map((lesson, lessonIndex) => ({
      ...lesson,
      moduleTitle: module.title,
      displayName: `${moduleIndex + 1}.${lessonIndex + 1} - ${lesson.title}`,
      moduleIndex,
      lessonIndex
    }))
  );

  const totalMaterials = modules.reduce((acc, m) => acc + m.lessons.length, 0);

  if (modules.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">
          Crie módulos e aulas primeiro para adicionar materiais
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lesson Selector */}
      <div className="card-elegant p-4">
        <Label className="text-base font-semibold mb-3 block">
          Selecione uma aula para gerenciar materiais
        </Label>
        <Select value={selectedLesson} onValueChange={setSelectedLesson}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Escolha uma aula..." />
          </SelectTrigger>
          <SelectContent>
            {modules.map((module, moduleIndex) => (
              <div key={module.id}>
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                  Módulo {moduleIndex + 1}: {module.title}
                </div>
                {module.lessons.map((lesson, lessonIndex) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {moduleIndex + 1}.{lessonIndex + 1} - {lesson.title}
                  </SelectItem>
                ))}
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Material Upload Area */}
      {selectedLesson ? (
        <div className="card-elegant p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-secondary" />
            <h3 className="font-semibold">
              Materiais: {allLessons.find(l => l.id === selectedLesson)?.displayName}
            </h3>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-secondary border-t-transparent rounded-full" />
            </div>
          ) : (
            <MaterialUploader
              lessonId={selectedLesson}
              materials={materials}
              onMaterialsChange={fetchMaterials}
            />
          )}
        </div>
      ) : (
        <div className="card-elegant p-8 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">
            Selecione uma aula acima para adicionar ou gerenciar materiais
          </p>
        </div>
      )}

      {/* Quick stats */}
      <div className="text-sm text-muted-foreground">
        <p>Total de aulas disponíveis para materiais: {allLessons.length}</p>
      </div>
    </div>
  );
};

export default CourseMaterialsTab;
