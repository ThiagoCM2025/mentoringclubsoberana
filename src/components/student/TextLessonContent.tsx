import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  BookOpen,
  Download,
  FileText,
  Target,
  CheckCircle,
  Sparkles,
  Trophy,
  Lightbulb,
  Send,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AvatarMapForm } from "./AvatarMapForm";

interface Material {
  id: string;
  title: string;
  file_url: string;
  file_type: string | null;
}

interface RelatedMission {
  id: string;
  week_number: number;
  title: string;
  challenge_description: string | null;
  why_do: string | null;
  xp_reward: number;
}

interface MissionCompletion {
  id: string;
  status: string | null;
  admin_feedback: string | null;
}

interface TextLessonContentProps {
  lesson: {
    id: string;
    title: string;
    description: string | null;
    form_type?: string | null;
  };
  materials: Material[];
  relatedMission?: RelatedMission | null;
  missionCompletion?: MissionCompletion | null;
  isCompleted: boolean;
  onComplete: () => void;
  onMissionSubmit?: (missionId: string) => void;
}

const TextLessonContent = ({
  lesson,
  materials,
  relatedMission,
  missionCompletion,
  isCompleted,
  onComplete,
  onMissionSubmit
}: TextLessonContentProps) => {
  // Determine mission status
  const missionIsApproved = missionCompletion?.status === 'approved';
  const missionIsSubmitted = missionCompletion?.status === 'submitted' || missionCompletion?.status === 'pending';
  const missionIsRejected = missionCompletion?.status === 'rejected';

  // Check if this lesson has a special form type
  const isAvatarMapForm = lesson.form_type === 'avatar_map' ||
    materials.some(m => 
      m.file_url?.includes('1t1bfc9BieVxsYmLMpXEJZYioUpCJ49eE') || // Google Doc ID from user's link
      m.title?.toLowerCase().includes('mapa do avatar') ||
      m.title?.toLowerCase().includes('nicho') && m.title?.toLowerCase().includes('avatar')
    );

  // If it's an avatar map form, render the interactive form AND the mission section
  if (isAvatarMapForm) {
    return (
      <div className="w-full bg-zinc-900 py-6 space-y-8">
        {/* Formulário do Mapa do Avatar */}
        <AvatarMapForm
          lessonId={lesson.id}
          onComplete={onComplete}
        />

        {/* Missão Adicional (Sua Voz no Mundo Digital) */}
        {relatedMission && (
          <div className="max-w-4xl mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2 text-secondary">
                <Target className="w-5 h-5" />
                <h3 className="font-semibold text-lg">Missão desta Aula</h3>
                {relatedMission.xp_reward > 0 && (
                  <Badge className="bg-secondary/20 text-secondary border-0 ml-2">
                    <Sparkles className="w-3 h-3 mr-1" />
                    +{relatedMission.xp_reward} XP
                  </Badge>
                )}
              </div>

              {/* Mission Card */}
              <Card className={cn(
                "border-2 bg-zinc-800/50 backdrop-blur-sm",
                missionIsApproved && "border-green-500/50 bg-green-500/5",
                missionIsSubmitted && "border-amber-500/50 bg-amber-500/5",
                missionIsRejected && "border-red-500/50 bg-red-500/5",
                !missionCompletion && "border-secondary/40 glow-gold-subtle"
              )}>
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        missionIsApproved ? "bg-green-500/20" : "bg-secondary/20"
                      )}>
                        {missionIsApproved ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <Trophy className="w-5 h-5 text-secondary" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs text-cream/50 uppercase">Semana {relatedMission.week_number}</p>
                        <h4 className="font-serif font-bold text-cream">{relatedMission.title}</h4>
                      </div>
                    </div>
                    <Badge variant="outline" className={cn(
                      missionIsApproved && "border-green-500 text-green-400",
                      missionIsSubmitted && "border-amber-500 text-amber-400",
                      missionIsRejected && "border-red-500 text-red-400",
                      !missionCompletion && "border-secondary text-secondary"
                    )}>
                      {missionIsApproved && "✓ Concluída"}
                      {missionIsSubmitted && "⏳ Aguardando"}
                      {missionIsRejected && "↻ Reenviar"}
                      {!missionCompletion && `${relatedMission.xp_reward} XP`}
                    </Badge>
                  </div>

                  {relatedMission.challenge_description && (
                    <div className="flex gap-3">
                      <Target className="w-4 h-4 text-secondary shrink-0 mt-1" />
                      <p className="text-cream/80 text-sm">{relatedMission.challenge_description}</p>
                    </div>
                  )}

                  {relatedMission.why_do && (
                    <div className="flex gap-3">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                      <p className="text-cream/60 text-sm">{relatedMission.why_do}</p>
                    </div>
                  )}

                  {/* Action Button */}
                  {missionIsApproved ? (
                    <div className="flex items-center justify-center gap-2 text-green-400 py-2 bg-green-500/10 rounded-lg">
                      <CheckCircle className="w-4 h-4" />
                      <span className="font-medium text-sm">Missão Completada!</span>
                    </div>
                  ) : missionIsSubmitted ? (
                    <div className="flex items-center justify-center gap-2 text-amber-400 py-2 bg-amber-500/10 rounded-lg">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Aguardando aprovação</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => onMissionSubmit?.(relatedMission.id)}
                      className="w-full bg-secondary hover:bg-secondary/90 text-black font-semibold"
                      size="sm"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {missionIsRejected ? "Reenviar Entrega" : "Entregar Missão"}
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Seção de Conclusão */}
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div
              onClick={() => !isCompleted && onComplete()}
              className={`flex items-center justify-center gap-4 p-6 rounded-xl cursor-pointer transition-all ${
                isCompleted
                  ? "bg-green-500/10 border-2 border-green-500/30"
                  : "bg-secondary/10 border-2 border-secondary/30 hover:bg-secondary/20 hover:border-secondary/50"
              }`}
            >
              <Checkbox
                checked={isCompleted}
                onCheckedChange={() => !isCompleted && onComplete()}
                className={`h-7 w-7 rounded-lg border-2 ${
                  isCompleted
                    ? "bg-green-500 border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                    : "border-secondary/50 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                }`}
              />
              <div className="text-center">
                <p className={`font-semibold text-lg ${isCompleted ? "text-green-400" : "text-cream"}`}>
                  {isCompleted ? (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Material concluído!
                    </span>
                  ) : (
                    "Marcar como concluído"
                  )}
                </p>
                <p className="text-sm text-cream/50 mt-1">
                  {isCompleted
                    ? "Você já estudou este material"
                    : "Clique após preencher o formulário e entregar a missão"
                  }
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-zinc-900 border-secondary/20 overflow-hidden">
          <CardHeader className="pb-4 border-b border-secondary/10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-secondary" />
              </div>
              <Badge variant="outline" className="border-secondary/40 text-secondary bg-secondary/10">
                <FileText className="w-3 h-3 mr-1" />
                MATERIAL DE ESTUDO
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-cream">
              {lesson.title}
            </h1>
          </CardHeader>

          <CardContent className="pt-6 space-y-8">
            {/* Description */}
            {lesson.description && (
              <div className="prose prose-invert max-w-none">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                  <p className="text-cream/80 leading-relaxed text-lg">
                    {lesson.description}
                  </p>
                </div>
              </div>
            )}

            {/* Materials Section */}
            {materials.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-secondary">
                  <Download className="w-5 h-5" />
                  <h3 className="font-semibold text-lg">Materiais para Download</h3>
                </div>
                <div className="grid gap-3">
                  {materials.map((material, index) => (
                    <motion.a
                      key={material.id}
                      href={material.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center gap-4 p-4 rounded-xl bg-zinc-800/50 border border-secondary/20 hover:border-secondary/50 hover:bg-zinc-800 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                        <FileText className="w-5 h-5 text-secondary-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-cream group-hover:text-secondary transition-colors">
                          {material.title}
                        </p>
                        <p className="text-sm text-cream/50 uppercase">
                          {material.file_type || "Arquivo"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-secondary hover:bg-secondary/20"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar
                      </Button>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Related Mission Section */}
            {relatedMission && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-4 pt-4 border-t border-secondary/10"
              >
                <div className="flex items-center gap-2 text-secondary">
                  <Target className="w-5 h-5" />
                  <h3 className="font-semibold text-lg">Missão desta Aula</h3>
                  {relatedMission.xp_reward > 0 && (
                    <Badge className="bg-secondary/20 text-secondary border-0 ml-2">
                      <Sparkles className="w-3 h-3 mr-1" />
                      +{relatedMission.xp_reward} XP
                    </Badge>
                  )}
                </div>

                {/* Inline Mission Card */}
                <Card className={cn(
                  "border-2 bg-zinc-800/50 backdrop-blur-sm",
                  missionIsApproved && "border-green-500/50 bg-green-500/5",
                  missionIsSubmitted && "border-amber-500/50 bg-amber-500/5",
                  missionIsRejected && "border-red-500/50 bg-red-500/5",
                  !missionCompletion && "border-secondary/40 glow-gold-subtle"
                )}>
                  <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          missionIsApproved ? "bg-green-500/20" : "bg-secondary/20"
                        )}>
                          {missionIsApproved ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <Trophy className="w-5 h-5 text-secondary" />
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-cream/50 uppercase">Semana {relatedMission.week_number}</p>
                          <h4 className="font-serif font-bold text-cream">{relatedMission.title}</h4>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn(
                        missionIsApproved && "border-green-500 text-green-400",
                        missionIsSubmitted && "border-amber-500 text-amber-400",
                        missionIsRejected && "border-red-500 text-red-400",
                        !missionCompletion && "border-secondary text-secondary"
                      )}>
                        {missionIsApproved && "✓ Concluída"}
                        {missionIsSubmitted && "⏳ Aguardando"}
                        {missionIsRejected && "↻ Reenviar"}
                        {!missionCompletion && `${relatedMission.xp_reward} XP`}
                      </Badge>
                    </div>

                    {relatedMission.challenge_description && (
                      <div className="flex gap-3">
                        <Target className="w-4 h-4 text-secondary shrink-0 mt-1" />
                        <p className="text-cream/80 text-sm">{relatedMission.challenge_description}</p>
                      </div>
                    )}

                    {relatedMission.why_do && (
                      <div className="flex gap-3">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                        <p className="text-cream/60 text-sm">{relatedMission.why_do}</p>
                      </div>
                    )}

                    {/* Action Button */}
                    {missionIsApproved ? (
                      <div className="flex items-center justify-center gap-2 text-green-400 py-2 bg-green-500/10 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium text-sm">Missão Completada!</span>
                      </div>
                    ) : missionIsSubmitted ? (
                      <div className="flex items-center justify-center gap-2 text-amber-400 py-2 bg-amber-500/10 rounded-lg">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">Aguardando aprovação</span>
                      </div>
                    ) : (
                      <Button
                        onClick={() => onMissionSubmit?.(relatedMission.id)}
                        className="w-full bg-secondary hover:bg-secondary/90 text-black font-semibold"
                        size="sm"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {missionIsRejected ? "Reenviar Entrega" : "Entregar Missão"}
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Completion Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="pt-6 border-t border-secondary/10"
            >
              <div
                onClick={() => !isCompleted && onComplete()}
                className={`flex items-center justify-center gap-4 p-6 rounded-xl cursor-pointer transition-all ${
                  isCompleted
                    ? "bg-green-500/10 border-2 border-green-500/30"
                    : "bg-secondary/10 border-2 border-secondary/30 hover:bg-secondary/20 hover:border-secondary/50"
                }`}
              >
                <Checkbox
                  checked={isCompleted}
                  onCheckedChange={() => !isCompleted && onComplete()}
                  className={`h-7 w-7 rounded-lg border-2 ${
                    isCompleted
                      ? "bg-green-500 border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                      : "border-secondary/50 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                  }`}
                />
                <div className="text-center">
                  <p className={`font-semibold text-lg ${isCompleted ? "text-green-400" : "text-cream"}`}>
                    {isCompleted ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Material concluído!
                      </span>
                    ) : (
                      "Marcar como concluído"
                    )}
                  </p>
                  <p className="text-sm text-cream/50 mt-1">
                    {isCompleted
                      ? "Você já estudou este material"
                      : "Clique após estudar o material e fazer os downloads"
                    }
                  </p>
                </div>
              </div>
            </motion.div>

            {/* No Content Fallback */}
            {!lesson.description && materials.length === 0 && !relatedMission && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-cream/20 mx-auto mb-4" />
                <h3 className="text-xl font-serif font-semibold text-cream mb-2">
                  Conteúdo em preparação
                </h3>
                <p className="text-cream/50">
                  O material desta aula está sendo preparado com carinho para você.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TextLessonContent;
