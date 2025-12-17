import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  Award,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Flame,
  Trophy,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import brandLogo from "@/assets/brand-logo.png";

interface StudentSidebarProps {
  onSignOut: () => void;
  studentName: string;
  xp?: number;
  streak?: number;
}

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/student" },
  { icon: BookOpen, label: "Meus Cursos", path: "/student/courses" },
  { icon: Trophy, label: "Conquistas", path: "/student/achievements" },
  { icon: Award, label: "Certificados", path: "/student/certificates" },
  { icon: User, label: "Perfil", path: "/student/profile" },
];

const StudentSidebar = ({ onSignOut, studentName, xp = 0, streak = 0 }: StudentSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="fixed left-0 top-0 h-screen bg-sidebar-background border-r border-sidebar-border z-50 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img 
            src={brandLogo} 
            alt="Soberana" 
            className="w-10 h-10 object-contain"
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-serif font-bold text-sidebar-foreground text-lg"
              >
                Soberana
              </motion.span>
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
            className="p-4 border-b border-sidebar-border"
          >
            <p className="text-sidebar-foreground font-medium truncate">
              {studentName}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1 text-sidebar-primary">
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
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
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
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <button
          onClick={onSignOut}
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-lg w-full transition-all duration-200",
            "text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive"
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
      </div>

      {/* Collapse Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar-accent border border-sidebar-border text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
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
