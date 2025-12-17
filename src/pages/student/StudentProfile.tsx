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
import isotipoGold from "@/assets/brand/isotipo-s-framed-gold.png";
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

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem.",
        variant: "destructive",
      });
      return;
    }

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

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const publicUrlWithTimestamp = `${publicUrl}?t=${Date.now()}`;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrlWithTimestamp })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrlWithTimestamp } : null);

      toast({
        title: "Foto atualizada!",
        description: "Sua foto de perfil foi alterada com sucesso.",
      });

      await fetchProfile();
    } catch (error) {
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-secondary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/95 backdrop-blur-sm border-b border-secondary/20 py-4 px-4 sticky top-0 z-50">
        <div className="container-soberana flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/student")}
              className="text-cream/70 hover:text-secondary hover:bg-secondary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <img src={isotipoGold} alt="Soberana" className="w-10 h-10 object-contain" />
              <span className="font-serif font-bold text-xl text-secondary">Meu Perfil</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container-soberana py-8 max-w-2xl px-4">
        {/* Avatar Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-secondary glow-gold">
              <AvatarImage src={profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-zinc-800 text-secondary text-2xl">
                {authorInitials}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleAvatarClick}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-secondary text-black flex items-center justify-center hover:bg-secondary/90 transition-colors disabled:opacity-50 glow-gold-subtle"
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
          <h2 className="text-xl font-semibold mt-4 text-cream">{authorName}</h2>
          <p className="text-cream/50 text-sm">{user?.email}</p>
        </div>

        {/* Personal Data */}
        <div className="bg-zinc-900 rounded-xl border border-secondary/10 p-6 mb-6 card-glow-gold">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-secondary" />
            <h3 className="font-semibold text-lg text-cream">Dados Pessoais</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-cream/70">Nome completo</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
                className="bg-zinc-800 border-secondary/20 text-cream focus:border-secondary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-cream/70">Telefone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(00) 00000-0000"
                className="bg-zinc-800 border-secondary/20 text-cream focus:border-secondary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-cream/70">Email</Label>
              <Input
                id="email"
                value={user?.email || ""}
                disabled
                className="bg-zinc-800/50 border-secondary/10 text-cream/50"
              />
              <p className="text-xs text-cream/40">O email não pode ser alterado.</p>
            </div>

            <Button 
              onClick={handleSaveProfile} 
              disabled={saving}
              className="w-full bg-secondary hover:bg-secondary/90 text-black btn-glow-gold"
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
        <div className="bg-zinc-900 rounded-xl border border-secondary/10 p-6 mb-6 card-glow-gold">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-secondary" />
            <h3 className="font-semibold text-lg text-cream">Preferências de Notificação</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-cream">Lembretes de estudo</Label>
                <p className="text-sm text-cream/50">
                  Receber lembretes por email nos horários configurados
                </p>
              </div>
              <Switch
                checked={emailReminders}
                onCheckedChange={setEmailReminders}
              />
            </div>

            <Separator className="bg-secondary/10" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-cream">Novas aulas</Label>
                <p className="text-sm text-cream/50">
                  Ser notificada quando novos conteúdos forem publicados
                </p>
              </div>
              <Switch
                checked={emailNewLessons}
                onCheckedChange={setEmailNewLessons}
              />
            </div>

            <Separator className="bg-secondary/10" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-cream">Atualizações da comunidade</Label>
                <p className="text-sm text-cream/50">
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
        <div className="bg-zinc-900 rounded-xl border border-secondary/10 p-6 mb-6 card-glow-gold">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-secondary" />
              <h3 className="font-semibold text-lg text-cream">Meus Lembretes de Estudo</h3>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setReminderDialogOpen(true)}
              className="border-secondary/30 text-secondary hover:bg-secondary/10"
            >
              + Novo
            </Button>
          </div>

          {reminders.length === 0 ? (
            <p className="text-cream/50 text-center py-4">
              Você ainda não tem lembretes configurados.
            </p>
          ) : (
            <div className="space-y-3">
              {reminders.map((reminder) => (
                <div 
                  key={reminder.id} 
                  className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg border border-secondary/10"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm text-cream">{reminder.title}</p>
                    <p className="text-xs text-cream/50">
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
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Gamification Stats */}
        <div className="bg-zinc-900 rounded-xl border border-secondary/10 p-6 card-glow-gold">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-secondary" />
            <h3 className="font-semibold text-lg text-cream">Estatísticas</h3>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-zinc-800 rounded-lg border border-secondary/10">
              <Zap className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold text-cream">{gamification?.xp || 0}</p>
              <p className="text-xs text-cream/50">XP Total</p>
            </div>
            <div className="p-4 bg-zinc-800 rounded-lg border border-orange-500/20">
              <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-cream">{gamification?.streak_days || 0}</p>
              <p className="text-xs text-cream/50">Dias de Streak</p>
            </div>
            <div className="p-4 bg-zinc-800 rounded-lg border border-secondary/10">
              <BookOpen className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-2xl font-bold text-cream">{gamification?.total_lessons_completed || 0}</p>
              <p className="text-xs text-cream/50">Aulas</p>
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
