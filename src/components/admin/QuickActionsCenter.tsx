import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Plus,
  X,
  UserPlus,
  GraduationCap,
  Send,
  Target,
  FileText,
  ClipboardCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuickActionsCenterProps {
  onCreateStudent?: () => void;
  onCreateLead?: () => void;
  onEnrollStudent?: () => void;
  onBulkNotification?: () => void;
}

const actions = [
  {
    id: "create-student",
    icon: UserPlus,
    label: "Nova Aluna",
    color: "bg-emerald-500 hover:bg-emerald-600",
  },
  {
    id: "create-lead",
    icon: Target,
    label: "Novo Lead",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    id: "enroll-student",
    icon: GraduationCap,
    label: "Matricular",
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    id: "bulk-notification",
    icon: Send,
    label: "Notificação em Massa",
    color: "bg-orange-500 hover:bg-orange-600",
  },
  {
    id: "mission-reviews",
    icon: ClipboardCheck,
    label: "Revisar Missões",
    color: "bg-pink-500 hover:bg-pink-600",
    href: "/admin/mission-reviews",
  },
  {
    id: "create-post",
    icon: FileText,
    label: "Novo Post",
    color: "bg-cyan-500 hover:bg-cyan-600",
    href: "/admin/blog/new",
  },
];

export const QuickActionsCenter = ({
  onCreateStudent,
  onCreateLead,
  onEnrollStudent,
  onBulkNotification,
}: QuickActionsCenterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleAction = (actionId: string, href?: string) => {
    setIsOpen(false);

    if (href) {
      navigate(href);
      return;
    }

    switch (actionId) {
      case "create-student":
        onCreateStudent?.();
        break;
      case "create-lead":
        onCreateLead?.();
        break;
      case "enroll-student":
        onEnrollStudent?.();
        break;
      case "bulk-notification":
        onBulkNotification?.();
        break;
    }
  };

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-16 right-0 flex flex-col-reverse gap-3 mb-2"
            >
              {actions.map((action, index) => (
                <Tooltip key={action.id}>
                  <TooltipTrigger asChild>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        y: 0,
                        transition: { delay: index * 0.05 }
                      }}
                      exit={{ 
                        opacity: 0, 
                        y: 20,
                        transition: { delay: (actions.length - index - 1) * 0.03 }
                      }}
                    >
                      <Button
                        size="icon"
                        className={`w-12 h-12 rounded-full shadow-lg text-white ${action.color}`}
                        onClick={() => handleAction(action.id, action.href)}
                      >
                        <action.icon className="w-5 h-5" />
                      </Button>
                    </motion.div>
                  </TooltipTrigger>
                  <TooltipContent side="left" sideOffset={8}>
                    <p>{action.label}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB Button */}
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            size="icon"
            className="w-14 h-14 rounded-full shadow-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Plus className="w-6 h-6" />
            )}
          </Button>
        </motion.div>

        {/* Pulse animation when closed */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-secondary/30 animate-ping" />
        )}
      </div>
    </TooltipProvider>
  );
};
