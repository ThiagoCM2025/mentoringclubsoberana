import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare,
  FileText,
  Link as LinkIcon,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SubmissionHistoryItem {
  id: string;
  status: string;
  proof_content: string | null;
  proof_links: string[] | null;
  proof_file_url: string | null;
  admin_feedback: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
}

interface MissionSubmissionHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  missionId: string;
  userId: string;
  weekNumber: number;
}

export const MissionSubmissionHistory = ({
  open,
  onOpenChange,
  missionId,
  userId,
  weekNumber
}: MissionSubmissionHistoryProps) => {
  const [history, setHistory] = useState<SubmissionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && missionId && userId) {
      fetchHistory();
    }
  }, [open, missionId, userId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("mission_submission_history")
        .select("*")
        .eq("mission_id", missionId)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error("Error fetching submission history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return {
          label: "Aprovada",
          icon: CheckCircle2,
          bgColor: "bg-green-500/15",
          borderColor: "border-green-500/30",
          textColor: "text-green-400",
          badgeVariant: "default" as const
        };
      case "rejected":
        return {
          label: "Necessita Correções",
          icon: XCircle,
          bgColor: "bg-red-500/15",
          borderColor: "border-red-500/30",
          textColor: "text-red-400",
          badgeVariant: "destructive" as const
        };
      default:
        return {
          label: "Enviada",
          icon: Clock,
          bgColor: "bg-amber-500/15",
          borderColor: "border-amber-500/30",
          textColor: "text-amber-400",
          badgeVariant: "secondary" as const
        };
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    try {
      return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return "—";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-background/95 backdrop-blur-xl border-secondary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-cream">
            <History className="w-5 h-5 text-secondary" />
            Histórico de Submissões - Semana {weekNumber}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Clock className="w-6 h-6 text-secondary/60" />
              </motion.div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-cream/50">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>Nenhum histórico de submissão encontrado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((item, index) => {
                const config = getStatusConfig(item.status);
                const StatusIcon = config.icon;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "p-4 rounded-xl border",
                      config.bgColor,
                      config.borderColor
                    )}
                  >
                    {/* Header com Status e Data */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <StatusIcon className={cn("w-4 h-4", config.textColor)} />
                        <Badge variant={config.badgeVariant} className="text-xs">
                          {config.label}
                        </Badge>
                        {index === 0 && (
                          <Badge variant="outline" className="text-xs border-secondary/30 text-secondary">
                            Mais recente
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-cream/50">
                        {formatDate(item.submitted_at || item.created_at)}
                      </span>
                    </div>

                    {/* Conteúdo Enviado */}
                    {item.proof_content && (
                      <div className="mb-3">
                        <p className="text-xs text-cream/50 mb-1 flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          Conteúdo enviado:
                        </p>
                        <p className="text-sm text-cream/80 bg-black/20 p-2 rounded-lg line-clamp-3">
                          {item.proof_content}
                        </p>
                      </div>
                    )}

                    {/* Links */}
                    {item.proof_links && item.proof_links.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-cream/50 mb-1 flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" />
                          Links:
                        </p>
                        <div className="space-y-1">
                          {item.proof_links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-secondary hover:underline block truncate"
                            >
                              {link}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Imagem */}
                    {item.proof_file_url && (
                      <div className="mb-3">
                        <p className="text-xs text-cream/50 mb-1 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          Arquivo anexado
                        </p>
                        <a
                          href={item.proof_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-secondary hover:underline"
                        >
                          Ver arquivo
                        </a>
                      </div>
                    )}

                    {/* Feedback da Mentora */}
                    {item.admin_feedback && (
                      <div className={cn(
                        "p-3 rounded-lg mt-2",
                        item.status === "approved" ? "bg-green-500/10" : "bg-red-500/10"
                      )}>
                        <p className="text-xs text-cream/50 mb-1 flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          Feedback da Mentora:
                        </p>
                        <p className={cn(
                          "text-sm",
                          item.status === "approved" ? "text-green-300/90" : "text-red-300/90"
                        )}>
                          {item.admin_feedback}
                        </p>
                        {item.reviewed_at && (
                          <p className="text-xs text-cream/40 mt-2">
                            Revisado em {formatDate(item.reviewed_at)}
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
