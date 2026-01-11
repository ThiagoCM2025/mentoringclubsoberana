import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Trophy, CheckCircle } from "lucide-react";

interface Mission {
  id: string;
  week_number: number;
  title: string;
  challenge_description: string;
  gamification_emoji: string | null;
  gamification_title: string | null;
  xp_reward: number | null;
  is_active: boolean | null;
}

interface MissionCardProps {
  mission: Mission;
  onEdit: () => void;
  onDelete: () => void;
}

const MissionCard = ({ mission, onEdit, onDelete }: MissionCardProps) => {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
      mission.is_active 
        ? 'bg-card border-border hover:border-primary/30' 
        : 'bg-muted/30 border-border/50'
    }`}>
      {/* Week Badge */}
      <div className="flex-shrink-0">
        <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center text-sm font-bold ${
          mission.is_active 
            ? 'bg-primary/10 text-primary' 
            : 'bg-muted text-muted-foreground'
        }`}>
          <span className="text-lg">{mission.gamification_emoji || "🎯"}</span>
          <span className="text-xs">S{mission.week_number}</span>
        </div>
      </div>

      {/* Mission Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className={`font-medium truncate ${
            mission.is_active ? 'text-foreground' : 'text-muted-foreground'
          }`}>
            {mission.title}
          </h4>
          {!mission.is_active && (
            <Badge variant="secondary" className="text-xs">Inativa</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
          {mission.challenge_description}
        </p>
        {mission.gamification_title && (
          <p className="text-xs text-primary mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            {mission.gamification_title}
          </p>
        )}
      </div>

      {/* XP Badge */}
      <div className="flex-shrink-0">
        <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
          <Trophy className="w-3 h-3 mr-1" />
          {mission.xp_reward || 0} XP
        </Badge>
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-8 w-8"
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="h-8 w-8 text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default MissionCard;
