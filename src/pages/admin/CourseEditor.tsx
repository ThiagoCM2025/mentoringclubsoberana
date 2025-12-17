import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Settings, Layers, FileText, Eye } from "lucide-react";

// Tab Components
import CourseBasicInfoTab from "@/components/admin/course/CourseBasicInfoTab";
import ModuleManager from "@/components/admin/course/ModuleManager";
import CourseMaterialsTab from "@/components/admin/course/CourseMaterialsTab";
import CoursePreviewTab from "@/components/admin/course/CoursePreviewTab";

interface Course {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number | null;
  is_published: boolean;
  is_subscription: boolean;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_free: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  lessons: Lesson[];
}

const CourseEditor = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isNew = courseId === "new";

  const [course, setCourse] = useState<Partial<Course>>({
    title: "",
    description: "",
    thumbnail_url: "",
    price: null,
    is_published: false,
    is_subscription: false,
  });
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  useEffect(() => {
    if (!isNew && courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    if (!courseId) return;

    const { data: courseData } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (courseData) setCourse(courseData);

    const { data: modulesData } = await supabase
      .from("modules")
      .select(`
        id,
        title,
        description,
        order_index,
        lessons (
          id,
          title,
          description,
          video_url,
          duration_minutes,
          order_index,
          is_free
        )
      `)
      .eq("course_id", courseId)
      .order("order_index");

    if (modulesData) {
      const sorted = modulesData.map(m => ({
        ...m,
        lessons: (m.lessons || []).sort((a: Lesson, b: Lesson) => a.order_index - b.order_index)
      }));
      setModules(sorted as Module[]);
    }

    setLoading(false);
  };

  const saveCourse = async () => {
    if (!course.title) {
      toast({ title: "Título é obrigatório", variant: "destructive" });
      return;
    }

    setSaving(true);

    try {
      if (isNew) {
        const { data, error } = await supabase
          .from("courses")
          .insert({
            title: course.title,
            description: course.description,
            thumbnail_url: course.thumbnail_url,
            price: course.price,
            is_published: course.is_published,
            is_subscription: course.is_subscription,
          })
          .select()
          .single();

        if (error) throw error;
        toast({ title: "Curso criado com sucesso!" });
        navigate(`/admin/courses/${data.id}`);
      } else {
        const { error } = await supabase
          .from("courses")
          .update({
            title: course.title,
            description: course.description,
            thumbnail_url: course.thumbnail_url,
            price: course.price,
            is_published: course.is_published,
            is_subscription: course.is_subscription,
          })
          .eq("id", courseId);

        if (error) throw error;
        toast({ title: "Curso atualizado!" });
      }
    } catch (error) {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/courses")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-foreground">
              {isNew ? "Novo Curso" : course.title || "Editar Curso"}
            </h1>
            {!isNew && (
              <p className="text-sm text-muted-foreground">
                {modules.length} módulo(s) • {modules.reduce((acc, m) => acc + m.lessons.length, 0)} aula(s)
              </p>
            )}
          </div>
          <Button onClick={saveCourse} disabled={saving} className="bg-primary hover:bg-primary/90">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </motion.div>

        {/* Main Content with Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start mb-6 bg-muted/50 p-1 h-auto flex-wrap">
              <TabsTrigger value="basic" className="gap-2 data-[state=active]:bg-background">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Informações</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
              <TabsTrigger 
                value="modules" 
                className="gap-2 data-[state=active]:bg-background"
                disabled={isNew}
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Módulos e Aulas</span>
                <span className="sm:hidden">Módulos</span>
              </TabsTrigger>
              <TabsTrigger 
                value="materials" 
                className="gap-2 data-[state=active]:bg-background"
                disabled={isNew}
              >
                <FileText className="w-4 h-4" />
                Materiais
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                className="gap-2 data-[state=active]:bg-background"
                disabled={isNew}
              >
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            {/* Tab: Basic Info */}
            <TabsContent value="basic" className="mt-0">
              <div className="card-elegant p-6">
                <CourseBasicInfoTab
                  course={course}
                  onChange={setCourse}
                />
              </div>
            </TabsContent>

            {/* Tab: Modules & Lessons */}
            <TabsContent value="modules" className="mt-0">
              <div className="card-elegant p-6">
                {courseId && courseId !== "new" && (
                  <ModuleManager
                    courseId={courseId}
                    modules={modules}
                    onRefresh={fetchCourse}
                  />
                )}
              </div>
            </TabsContent>

            {/* Tab: Materials */}
            <TabsContent value="materials" className="mt-0">
              <div className="card-elegant p-6">
                <CourseMaterialsTab modules={modules} />
              </div>
            </TabsContent>

            {/* Tab: Preview */}
            <TabsContent value="preview" className="mt-0">
              <CoursePreviewTab
                course={{
                  title: course.title || "",
                  description: course.description || null,
                  thumbnail_url: course.thumbnail_url || null,
                  price: course.price || null,
                  is_published: course.is_published || false,
                  is_subscription: course.is_subscription || false,
                }}
                modules={modules}
              />
            </TabsContent>
          </Tabs>

          {/* Hint for new courses */}
          {isNew && (
            <div className="mt-6 p-4 rounded-lg bg-secondary/10 border border-secondary/20">
              <p className="text-sm text-secondary">
                💡 Salve o curso primeiro para poder adicionar módulos, aulas e materiais.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default CourseEditor;
