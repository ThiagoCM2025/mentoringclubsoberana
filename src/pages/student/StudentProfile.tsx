import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useGamification } from "@/hooks/useGamification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  User,
  Camera,
  Save,
  Bell,
  Clock,
  Trash2,
  Zap,
  Flame,
  BookOpen,
  Loader2
} from "lucide-react";
import brandLogo from "@/assets/brand-logo.png";
import StudyReminderDialog from "@/components/student/StudyReminderDialog";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  email_reminders: boolean;
  email_new_lessons: boolean;
  email_community: boolean;
}

interface StudyReminder {
  id: string;
  title: string;
  reminder_days: string[];
  reminder_time: string;
  is_enabled: boolean;
}

const DAYS_MAP: Record<string, string> = {
  "monday": "Seg",
  "tuesday": "Ter",
  "wednesday": "Qua",
  "thursday": "Qui",
  "friday": "Sex",
  "saturday": "Sáb",
  "sunday": "Dom",
};

const StudentProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { stats: gamification } = useGamification();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [reminders, setReminders] = useState<StudyReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [emailReminders, setEmailReminders] = useState(true);
  const [emailNewLessons, setEmailNewLessons] = useState(true);
  const [emailCommunity, setEmailCommunity] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchReminders();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setProfile(data as Profile);
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
      setEmailReminders(data.email_reminders ?? true);
      setEmailNewLessons(data.email_new_lessons ?? true);
      setEmailCommunity(data.email_community ?? true);
    }

    setLoading(false);
  };

  const fetchReminders = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("study_reminders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      setReminders(data as StudyReminder[]);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingAvatar(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      console.log("Uploading avatar:", fileName);

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      // Get public URL with cache-busting timestamp
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Add cache-busting timestamp to URL
      const publicUrlWithTimestamp = `${publicUrl}?t=${Date.now()}`;
      console.log("Public URL with timestamp:", publicUrlWithTimestamp);

      // Update profile with new URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrlWithTimestamp })
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Update error:", updateError);
        throw updateError;
      }

      // Force state update
      setProfile(prev => prev ? { ...prev, avatar_url: publicUrlWithTimestamp } : null);

      toast({
        title: "Foto atualizada!",
        description: "Sua foto de perfil foi alterada com sucesso.",
      });

      // Refresh profile data to ensure sync
      await fetchProfile();
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a foto.",
        variant: "destructive",
      });
    }

    setUploadingAvatar(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName.trim() || null,
        phone: phone.trim() || null,
        email_reminders: emailReminders,
        email_new_lessons: emailNewLessons,
        email_community: emailCommunity,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Salvo!",
        description: "Suas informações foram atualizadas.",
      });
      fetchProfile();
    }

    setSaving(false);
  };

  const handleDeleteReminder = async (reminderId: string) => {
    const { error } = await supabase
      .from("study_reminders")
      .delete()
      .eq("id", reminderId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o lembrete.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Excluído",
        description: "Lembrete removido.",
      });
      fetchReminders();
    }
  };

  const handleToggleReminder = async (reminderId: string, isEnabled: boolean) => {
    const { error } = await supabase
      .from("study_reminders")
      .update({ is_enabled: isEnabled })
      .eq("id", reminderId);

    if (!error) {
      setReminders(prev => 
        prev.map(r => r.id === reminderId ? { ...r, is_enabled: isEnabled } : r)
      );
    }
  };

  const authorName = profile?.full_name || user?.email?.split("@")[0] || "Aluna";
  const authorInitials = authorName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-4 sticky top-0 z-50">
        <div className="container-soberana flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/student")}
              className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <img src={brandLogo} alt="Soberana" className="w-10 h-10 object-contain" />
              <span className="font-serif font-bold text-xl">Meu Perfil</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container-soberana py-8 max-w-2xl">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-secondary">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {authorInitials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center hover:bg-secondary/90 transition-colors disabled:opacity-50"
            >
              {uploadingAvatar ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <h2 className="text-xl font-semibold mt-4">{authorName}</h2>
          <p className="text-muted-foreground text-sm">{user?.email}</p>
        </div>

        {/* Personal Data */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Dados Pessoais</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
            </div>

            <Button 
              onClick={handleSaveProfile} 
              disabled={saving}
              className="w-full bg-secondary hover:bg-secondary/90"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar alterações
            </Button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-lg">Preferências de Notificação</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Lembretes de estudo</Label>
                <p className="text-sm text-muted-foreground">
                  Receber lembretes por email nos horários configurados
                </p>
              </div>
              <Switch
                checked={emailReminders}
                onCheckedChange={setEmailReminders}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Novas aulas</Label>
                <p className="text-sm text-muted-foreground">
                  Ser notificada quando novos conteúdos forem publicados
                </p>
              </div>
              <Switch
                checked={emailNewLessons}
                onCheckedChange={setEmailNewLessons}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Atualizações da comunidade</Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificações de atividade na comunidade
                </p>
              </div>
              <Switch
                checked={emailCommunity}
                onCheckedChange={setEmailCommunity}
              />
            </div>
          </div>
        </div>

        {/* Study Reminders */}
        <div className="bg-card rounded-xl border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Meus Lembretes de Estudo</h3>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReminderDialogOpen(true)}
            >
              + Novo
            </Button>
          </div>

          {reminders.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Você ainda não tem lembretes configurados.
            </p>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div 
                  key={reminder.id} 
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{reminder.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {reminder.reminder_days.map(d => DAYS_MAP[d] || d).join(", ")} às{" "}
                      {reminder.reminder_time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={reminder.is_enabled}
                      onCheckedChange={(checked) => handleToggleReminder(reminder.id, checked)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteReminder(reminder.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="bg-card rounded-xl border p-6">
          <h3 className="font-semibold text-lg mb-4">Minhas Estatísticas</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-secondary/10 rounded-lg">
              <Zap className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold text-secondary">{gamification?.xp || 0}</p>
              <p className="text-xs text-muted-foreground">XP Total</p>
            </div>
            <div className="p-4 bg-orange-500/10 rounded-lg">
              <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-500">{gamification?.streak_days || 0}</p>
              <p className="text-xs text-muted-foreground">Dias de Streak</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-primary">{gamification?.total_lessons_completed || 0}</p>
              <p className="text-xs text-muted-foreground">Aulas</p>
            </div>
          </div>
        </div>
      </main>

      <StudyReminderDialog
        open={reminderDialogOpen}
        onOpenChange={(open) => {
          setReminderDialogOpen(open);
          if (!open) fetchReminders();
        }}
      />
    </div>
  );
};

export default StudentProfile;
