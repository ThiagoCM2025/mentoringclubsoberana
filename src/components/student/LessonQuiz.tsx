import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  Sparkles,
  ChevronRight,
  RotateCcw,
  Loader2
} from "lucide-react";
import { useConfetti } from "@/hooks/useConfetti";

interface QuizQuestion {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string | null;
  points: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  passing_score: number;
  xp_reward: number;
}

interface LessonQuizProps {
  lessonId: string;
  onComplete?: () => void;
}

export function LessonQuiz({ lessonId, onComplete }: LessonQuizProps) {
  const { user } = useAuth();
  const { fireSuccessConfetti } = useConfetti();
  
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previousAttempt, setPreviousAttempt] = useState<{passed: boolean; score: number} | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [lessonId, user]);

  const fetchQuiz = async () => {
    if (!lessonId || !user) return;
    setLoading(true);

    try {
      // Fetch quiz for this lesson
      const { data: quizData } = await supabase
        .from("lesson_quizzes")
        .select("*")
        .eq("lesson_id", lessonId)
        .maybeSingle();

      if (!quizData) {
        setLoading(false);
        return;
      }

      setQuiz(quizData);

      // Fetch questions
      const { data: questionsData } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_id", quizData.id)
        .order("order_index");

      if (questionsData) {
        setQuestions(questionsData.map(q => ({
          ...q,
          options: Array.isArray(q.options) ? q.options as string[] : []
        })));
      }

      // Check for previous attempt
      const { data: attemptData } = await supabase
        .from("quiz_attempts")
        .select("passed, score")
        .eq("user_id", user.id)
        .eq("quiz_id", quizData.id)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (attemptData) {
        setPreviousAttempt(attemptData);
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    setShowExplanation(false);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!quiz || !user) return;
    setSubmitting(true);

    try {
      // Calculate score
      let correctAnswers = 0;
      let totalPoints = 0;
      let earnedPoints = 0;

      questions.forEach(q => {
        totalPoints += q.points;
        if (answers[q.id] === q.correct_answer) {
          correctAnswers++;
          earnedPoints += q.points;
        }
      });

      const scorePercentage = Math.round((earnedPoints / totalPoints) * 100);
      const passed = scorePercentage >= quiz.passing_score;
      const xpEarned = passed ? quiz.xp_reward : Math.round(quiz.xp_reward * 0.25);

      // Save attempt
      await supabase.from("quiz_attempts").insert({
        user_id: user.id,
        quiz_id: quiz.id,
        answers,
        score: scorePercentage,
        max_score: 100,
        passed,
        xp_earned: xpEarned
      });

      // Update gamification XP
      if (passed) {
        const { data: currentStats } = await supabase
          .from("user_gamification")
          .select("xp")
          .eq("user_id", user.id)
          .maybeSingle();
        
        if (currentStats) {
          await supabase
            .from("user_gamification")
            .update({ xp: currentStats.xp + xpEarned })
            .eq("user_id", user.id);
        }
      }

      setPreviousAttempt({ passed, score: scorePercentage });
      setShowResults(true);

      if (passed) {
        fireSuccessConfetti();
        toast.success(`Quiz concluído! +${xpEarned} XP`);
      } else {
        toast.info("Não foi dessa vez. Tente novamente!");
      }

      onComplete?.();
    } catch (error) {
      console.error("Error submitting quiz:", error);
      toast.error("Erro ao enviar quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setShowExplanation(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-secondary" />
      </div>
    );
  }

  if (!quiz || questions.length === 0) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isAnswered = currentQuestion && answers[currentQuestion.id];
  const isCorrect = currentQuestion && answers[currentQuestion.id] === currentQuestion.correct_answer;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  if (showResults) {
    const correctCount = questions.filter(q => answers[q.id] === q.correct_answer).length;
    const scorePercentage = previousAttempt?.score || 0;
    const passed = previousAttempt?.passed || false;

    return (
      <Card className="bg-zinc-900 border-secondary/30">
        <CardContent className="p-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            {passed ? (
              <>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-cream mb-2">Parabéns! 🎉</h3>
                <p className="text-cream/70 mb-4">Você passou no quiz com {scorePercentage}%</p>
                <p className="text-secondary font-semibold mb-6">+{quiz.xp_reward} XP</p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-cream mb-2">Quase lá!</h3>
                <p className="text-cream/70 mb-4">
                  Você acertou {correctCount} de {questions.length} ({scorePercentage}%)
                </p>
                <p className="text-cream/50 text-sm mb-6">
                  Você precisa de {quiz.passing_score}% para passar
                </p>
              </>
            )}

            <div className="flex gap-3 justify-center">
              {!passed && (
                <Button
                  onClick={handleRetry}
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
              )}
            </div>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-zinc-900 border-secondary/30">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-cream">
            <Brain className="w-5 h-5 text-secondary" />
            {quiz.title}
          </CardTitle>
          <span className="text-sm text-cream/60">
            {currentQuestionIndex + 1}/{questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2 bg-zinc-800" />
      </CardHeader>

      <CardContent className="p-6 pt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-lg font-medium text-cream mb-6">
              {currentQuestion.question_text}
            </p>

            <RadioGroup
              value={answers[currentQuestion.id] || ""}
              onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
              className="space-y-3"
            >
              {currentQuestion.options.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === option;
                const showCorrectness = showExplanation && isSelected;
                const isThisCorrect = option === currentQuestion.correct_answer;

                return (
                  <div
                    key={idx}
                    className={`relative flex items-center space-x-3 p-4 rounded-xl border transition-all cursor-pointer ${
                      showCorrectness
                        ? isThisCorrect
                          ? "border-green-500 bg-green-500/10"
                          : "border-red-500 bg-red-500/10"
                        : isSelected
                        ? "border-secondary bg-secondary/10"
                        : "border-secondary/20 hover:border-secondary/50 bg-zinc-800/50"
                    }`}
                    onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                  >
                    <RadioGroupItem
                      value={option}
                      id={`option-${idx}`}
                      className="border-secondary"
                    />
                    <Label
                      htmlFor={`option-${idx}`}
                      className="flex-1 cursor-pointer text-cream"
                    >
                      {option}
                    </Label>
                    {showCorrectness && (
                      isThisCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )
                    )}
                  </div>
                );
              })}
            </RadioGroup>

            {showExplanation && currentQuestion.explanation && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mt-4 p-4 rounded-xl bg-zinc-800 border border-secondary/20"
              >
                <p className="text-sm text-cream/70">
                  <span className="font-semibold text-secondary">Explicação: </span>
                  {currentQuestion.explanation}
                </p>
              </motion.div>
            )}

            <div className="flex items-center justify-between mt-6">
              {isAnswered && !showExplanation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowExplanation(true)}
                  className="border-secondary/30 text-cream hover:bg-secondary/10"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ver Explicação
                </Button>
              )}
              
              <div className="ml-auto">
                {currentQuestionIndex < questions.length - 1 ? (
                  <Button
                    onClick={handleNextQuestion}
                    disabled={!isAnswered}
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  >
                    Próxima
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={!isAnswered || submitting}
                    className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trophy className="w-4 h-4 mr-2" />
                    )}
                    Finalizar Quiz
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
