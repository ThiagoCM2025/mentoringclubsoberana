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
  Mail
} from "lucide-react";
import brandLogo from "@/assets/brand-logo.png";

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
    <div className="min-h-screen bg-muted/30 font-admin">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-primary text-primary-foreground p-4 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={brandLogo} alt="Soberana" className="w-8 h-8" />
          <span className="font-admin font-bold">Admin</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-primary-foreground"
        >
          <Menu className="w-6 h-6" />
        </Button>
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
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-left hover:bg-muted text-destructive"
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
          "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-primary text-primary-foreground transition-all duration-300 z-50",
          isSidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-primary-foreground/10">
          <div className={cn("flex items-center gap-3", !isSidebarOpen && "justify-center w-full")}>
            <img src={brandLogo} alt="Soberana" className="w-10 h-10" />
            {isSidebarOpen && <span className="font-admin font-bold text-lg">Admin</span>}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn("text-primary-foreground/70 hover:text-primary-foreground", !isSidebarOpen && "hidden")}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                location.pathname === item.href || location.pathname.startsWith(item.href + "/")
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground",
                !isSidebarOpen && "justify-center px-2"
              )}
              title={!isSidebarOpen ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {isSidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-primary-foreground/10">
          <button
            onClick={handleSignOut}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg w-full text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground transition-colors",
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