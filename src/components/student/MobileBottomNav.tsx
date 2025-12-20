import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Home, 
  BookOpen, 
  Users, 
  Trophy, 
  User
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { path: "/student", icon: Home, label: "Início" },
  { path: "/student/favorites", icon: BookOpen, label: "Aulas" },
  { path: "/student/community", icon: Users, label: "Comunidade" },
  { path: "/student/achievements", icon: Trophy, label: "Conquistas" },
  { path: "/student/profile", icon: User, label: "Perfil" },
];

export function MobileBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/student") {
      return location.pathname === "/student";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <motion.nav
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-black/95 backdrop-blur-lg border-t border-secondary/20 safe-area-bottom"
    >
      <div className="flex items-center justify-around py-2 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-xl transition-all",
                active 
                  ? "text-secondary" 
                  : "text-cream/50 hover:text-cream/70"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  "w-5 h-5 transition-all",
                  active && "scale-110"
                )} />
                {active && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-secondary"
                  />
                )}
              </div>
              <span className={cn(
                "text-[10px] mt-1 font-medium transition-all",
                active && "text-secondary"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </motion.nav>
  );
}
