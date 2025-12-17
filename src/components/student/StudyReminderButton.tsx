import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlarmClock } from "lucide-react";
import StudyReminderDialog from "./StudyReminderDialog";
import { cn } from "@/lib/utils";

interface StudyReminderButtonProps {
  className?: string;
}

const StudyReminderButton = ({ className }: StudyReminderButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDialogOpen(true)}
        className={cn(
          "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10",
          className
        )}
        title="Criar lembrete de estudo"
      >
        <AlarmClock className="w-5 h-5" />
      </Button>

      <StudyReminderDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
    </>
  );
};

export default StudyReminderButton;
