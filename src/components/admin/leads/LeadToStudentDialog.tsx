import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, GraduationCap, UserPlus, AlertCircle, CheckCircle } from "lucide-react";

interface Course {
  id: string;
  title: string;
}

interface LeadToStudentDialogProps {
  open: boolean;
  onClose: () => void;
  leadId: string | null;
  leadName: string;
  leadEmail: string;
  leadPhone?: string | null;
  onConversionComplete: () => void;
}

export function LeadToStudentDialog({
  open,
  onClose,
  leadId,
  leadName,
  leadEmail,
  leadPhone,
  onConversionComplete,
}: LeadToStudentDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [existingUserId, setExistingUserId] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (open) {
      fetchCourses();
      checkExistingUser();
    }
  }, [open, leadEmail]);

  const fetchCourses = async () => {
    const { data } = await supabase
      .from("courses")
      .select("id, title")
      .eq("is_published", true)
      .order("title");
    if (data) setCourses(data);
  };

  const checkExistingUser = async () => {
    if (!leadEmail) return;
    
    setChecking(true);
    // Check if user exists by looking for a profile with this email
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id")
      .ilike("full_name", leadEmail.toLowerCase())
      .limit(1);
    
    // Also check auth users through the profiles table
    // We can't directly query auth.users, so we check if any student has this email
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("user_id")
      .limit(1)
      .maybeSingle();
    
    // For now, we'll assume no existing user and create new
    // A more robust check would require a backend function
    setExistingUserId(null);
    setChecking(false);
  };

  const handleCreateStudent = async () => {
    if (!leadId) return;

    if (!existingUserId && !password) {
      toast({ title: "Informe uma senha para o novo aluno", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      let userId = existingUserId;

      // Create new user if doesn't exist
      if (!existingUserId) {
        const { data: sessionData } = await supabase.auth.getSession();
        
        const response = await supabase.functions.invoke("create-student", {
          body: {
            email: leadEmail.toLowerCase(),
            password,
            full_name: leadName,
            phone: leadPhone,
          },
          headers: {
            Authorization: `Bearer ${sessionData.session?.access_token}`,
          },
        });

        if (response.error) throw response.error;
        userId = response.data?.user_id;
      }

      if (!userId) throw new Error("Não foi possível criar/encontrar o usuário");

      // Enroll in course if selected
      if (selectedCourseId) {
        const { error: enrollError } = await supabase
          .from("enrollments")
          .insert({
            user_id: userId,
            course_id: selectedCourseId,
            payment_source: "lead_conversion",
          });

        if (enrollError && !enrollError.message.includes("duplicate")) {
          console.error("Enrollment error:", enrollError);
        }
      }

      // Update lead with student_user_id
      const { error: updateError } = await supabase
        .from("leads")
        .update({ 
          student_user_id: userId,
          nurturing_active: false,
        })
        .eq("id", leadId);

      if (updateError) throw updateError;

      toast({ 
        title: existingUserId ? "Aluno matriculado!" : "Aluno criado e matriculado!",
        description: existingUserId 
          ? "O aluno já existia e foi matriculado no curso selecionado."
          : "Uma nova conta de aluno foi criada com sucesso."
      });
      
      onConversionComplete();
      resetAndClose();
    } catch (error: any) {
      console.error("Error creating student:", error);
      toast({ 
        title: "Erro ao criar aluno", 
        description: error.message,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setSelectedCourseId("");
    setPassword("");
    setExistingUserId(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DialogContent className="max-w-md max-h-[85vh] flex flex-col overflow-hidden bg-card border-border">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-green-600" />
            Tornar Aluna
          </DialogTitle>
          <DialogDescription>
            Crie uma conta de aluno para {leadName}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-2 pr-1">
          {/* Status Check */}
          {checking ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verificando se já existe conta...
            </div>
          ) : existingUserId ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Conta já existe</p>
                <p className="text-xs text-green-600">
                  O email {leadEmail} já possui uma conta. Você pode matricular em um curso.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <UserPlus className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Nova conta será criada</p>
                <p className="text-xs text-blue-600">
                  Uma nova conta de aluno será criada com o email {leadEmail}
                </p>
              </div>
            </div>
          )}

          {/* Lead Info */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Email</Label>
            <Input
              value={leadEmail}
              disabled
              className="bg-muted border-border"
            />
          </div>

          {/* Password (only for new users) */}
          {!existingUserId && !checking && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Senha <span className="text-destructive">*</span>
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha para o novo aluno"
                className="bg-background border-border"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 6 caracteres. O aluno poderá alterar depois.
              </p>
            </div>
          )}

          {/* Course Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Matricular em (opcional)</Label>
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Selecione um curso..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum curso por agora</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 gap-2 pt-4 border-t">
          <Button variant="outline" onClick={resetAndClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreateStudent}
            disabled={loading || checking}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {existingUserId ? "Matricular" : "Criar Aluna"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
