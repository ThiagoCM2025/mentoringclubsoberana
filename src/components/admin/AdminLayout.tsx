import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Target,
  Bell,
  Mail,
  Activity
} from "lucide-react";
import isotipoGold from "@/assets/brand/isotipo-s-framed-gold.png";
import patternCirclesGold from "@/assets/brand/pattern-circles-gold.png";
import { AdminNotificationBell } from "./AdminNotificationBell";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: BookOpen, label: "Cursos", href: "/admin/courses" },
  { icon: Users, label: "Alunos", href: "/admin/students" },
  { icon: UserCheck, label: "Matrículas", href: "/admin/enrollments" },
  { icon: Target, label: "Leads", href: "/admin/leads" },
  { icon: BookOpen, label: "E-books", href: "/admin/ebooks" },
  { icon: Mail, label: "Comunicação", href: "/admin/messaging" },
  { icon: Activity, label: "Engajamento", href: "/admin/engagement" },
  { icon: Bell, label: "Notificações", href: "/admin/notifications" },
  { icon: Users, label: "Comunidade", href: "/admin/community" },
  { icon: BarChart3, label: "Relatórios", href: "/admin/reports" },
  { icon: Settings, label: "Configurações", href: "/admin/settings" },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background font-admin">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border p-4 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={isotipoGold} alt="Soberana" className="w-8 h-8 drop-shadow-[0_0_10px_rgba(166,144,97,0.3)]" />
          <div className="flex flex-col leading-tight">
            <span className="text-muted-foreground text-[7px] tracking-[0.15em] uppercase">
              Mentoring
            </span>
            <span className="text-muted-foreground text-[7px] tracking-[0.15em] uppercase -mt-0.5">
              Club
            </span>
            <span className="font-serif font-bold text-secondary text-xs tracking-wider mt-0.5">
              SOBERANA
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AdminNotificationBell />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-foreground"
          >
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-background z-40 pt-16">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  location.pathname === item.href
                    ? "bg-secondary/20 text-secondary border border-secondary/30"
                    : "text-muted-foreground hover:bg-secondary/10 hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left text-red-400 hover:bg-red-400/10"
            >
              <LogOut className="w-5 h-5" />
              Sair
            </button>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-card border-r border-border transition-all duration-300 z-50 overflow-hidden",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url(${patternCirclesGold})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '150px',
          }}
        />

        {/* Logo */}
        <div className="relative p-4 flex items-center justify-between border-b border-border">
          <div className={cn("flex items-center gap-3", !isSidebarOpen && "justify-center w-full")}>
            <img src={isotipoGold} alt="Soberana" className="w-10 h-10 drop-shadow-[0_0_10px_rgba(166,144,97,0.3)]" />
            {isSidebarOpen && (
              <div className="flex flex-col leading-tight">
                <span className="text-muted-foreground text-[9px] tracking-[0.15em] uppercase">
                  Mentoring
                </span>
                <span className="text-muted-foreground text-[9px] tracking-[0.15em] uppercase -mt-0.5">
                  Club
                </span>
                <span className="font-serif font-bold text-secondary text-sm tracking-wider mt-0.5">
                  SOBERANA
                </span>
              </div>
            )}
          </div>
          <div className={cn("flex items-center gap-1", !isSidebarOpen && "hidden")}>
            <AdminNotificationBell />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-muted-foreground hover:text-secondary hover:bg-secondary/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
                location.pathname === item.href || location.pathname.startsWith(item.href + "/")
                  ? "bg-secondary/20 text-secondary border border-secondary/30"
                  : "text-muted-foreground hover:bg-secondary/10 hover:text-foreground",
                !isSidebarOpen && "justify-center px-2"
              )}
              title={!isSidebarOpen ? item.label : undefined}
            >
              <item.icon className={cn("w-5 h-5 flex-shrink-0", 
                (location.pathname === item.href || location.pathname.startsWith(item.href + "/")) && "text-secondary"
              )} />
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="relative p-4 border-t border-border">
          <button
            onClick={handleSignOut}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg w-full text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors",
              !isSidebarOpen && "justify-center px-2"
            )}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300 pt-16 lg:pt-0",
          isSidebarOpen ? "lg:ml-64" : "lg:ml-20"
        )}
      >
        {children}
      </main>
    </div>
  );
};
