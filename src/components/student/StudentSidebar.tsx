import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  Award,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Flame,
  Trophy,
  Star,
  BarChart2,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import isotipoGold from "@/assets/brand/isotipo-s-framed-gold.png";
import patternCirclesGold from "@/assets/brand/pattern-circles-gold.png";
import { APP_VERSION } from "@/App";

interface StudentSidebarProps {
  onSignOut: () => void;
  studentName: string;
  xp?: number;
  streak?: number;
}

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/student" },
  { icon: BookOpen, label: "Meus Cursos", path: "/student/courses" },
  { icon: BarChart2, label: "Analytics", path: "/student/analytics" },
  { icon: Trophy, label: "Conquistas", path: "/student/achievements" },
  { icon: Award, label: "Certificados", path: "/student/certificates" },
  { icon: User, label: "Perfil", path: "/student/profile" },
];

const StudentSidebar = ({ onSignOut, studentName, xp = 0, streak = 0 }: StudentSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="fixed left-0 top-0 h-screen bg-black border-r border-secondary/20 z-50 flex flex-col overflow-hidden"
    >
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url(${patternCirclesGold})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '150px',
        }}
      />

      {/* Header */}
      <div className="relative p-4 border-b border-secondary/20">
        <div className="flex items-center gap-3">
          <img 
            src={isotipoGold} 
            alt="Soberana" 
            className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(166,144,97,0.3)]"
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col leading-tight"
              >
                <span className="text-cream/70 text-[9px] tracking-[0.15em] uppercase">
                  Mentoring
                </span>
                <span className="text-cream/70 text-[9px] tracking-[0.15em] uppercase -mt-0.5">
                  Club
                </span>
                <span className="font-serif font-bold text-secondary text-sm tracking-wider mt-0.5">
                  SOBERANA
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* User Info */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative p-4 border-b border-secondary/20"
          >
            <p className="text-cream font-medium truncate">
              {studentName}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-secondary">
                <Star className="w-4 h-4" />
                <span className="text-sm font-medium">{xp} XP</span>
              </div>
              <div className="flex items-center gap-1 text-orange-400">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-medium">{streak} dias</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="relative flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-secondary/20 text-secondary border border-secondary/30"
                  : "text-cream/60 hover:bg-secondary/10 hover:text-cream"
              )}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "text-secondary")} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="relative p-3 border-t border-secondary/20 space-y-1">
        {/* Update button */}
        <button
          onClick={() => navigate('/clear-cache')}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-all duration-200",
            "text-cream/60 hover:bg-secondary/10 hover:text-secondary"
          )}
          title="Atualizar App"
        >
          <RefreshCw className="w-4 h-4 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm"
              >
                Atualizar App
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        
        {/* Logout button */}
        <button
          onClick={onSignOut}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-all duration-200",
            "text-cream/60 hover:bg-red-500/10 hover:text-red-400"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-medium"
              >
                Sair
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        
        {/* Version */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center pt-2 border-t border-secondary/10"
            >
              <span className="text-[10px] text-cream/30">v{APP_VERSION}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-zinc-900 border border-secondary/30 text-secondary hover:bg-secondary hover:text-black"
      >
        {collapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </Button>
    </motion.aside>
  );
};

export default StudentSidebar;
