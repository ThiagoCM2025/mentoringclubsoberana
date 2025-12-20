import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import isotipoGold from "@/assets/brand/isotipo-gold.png";
import { RewardsCenter } from "@/components/student/RewardsCenter";
import { useGamification } from "@/hooks/useGamification";
import { Skeleton } from "@/components/ui/skeleton";

const StudentRewards = () => {
  const navigate = useNavigate();
  const { stats, loading } = useGamification();

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/95 backdrop-blur-sm py-4 px-4 sticky top-0 z-50 border-b border-secondary/20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/student")}
              className="text-cream/70 hover:text-cream hover:bg-secondary/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <img 
                src={isotipoGold} 
                alt="Soberana" 
                className="w-8 h-8 object-contain isotipo-glow" 
              />
              <h1 className="text-lg font-serif font-bold text-cream">
                Recompensas
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4"
        >
          {loading ? (
            <>
              <Skeleton className="h-24 rounded-xl bg-zinc-800" />
              <Skeleton className="h-24 rounded-xl bg-zinc-800" />
              <Skeleton className="h-24 rounded-xl bg-zinc-800" />
            </>
          ) : (
            <>
              <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/20 to-secondary/5 border border-secondary/30 text-center">
                <p className="text-3xl font-bold text-secondary">{stats?.level || 1}</p>
                <p className="text-xs text-cream/60">Nível</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 text-center">
                <p className="text-3xl font-bold text-accent">{stats?.xp || 0}</p>
                <p className="text-xs text-cream/60">XP Total</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 text-center">
                <p className="text-3xl font-bold text-orange-500">{stats?.streak_days || 0}</p>
                <p className="text-xs text-cream/60">Dias de Streak</p>
              </div>
            </>
          )}
        </motion.div>

        {/* Rewards Center */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <RewardsCenter />
        </motion.div>
      </main>
    </div>
  );
};

export default StudentRewards;
