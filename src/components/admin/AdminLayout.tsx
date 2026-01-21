import { useState } from "react";
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
  Activity,
  FileText,
  ClipboardCheck,
  Search,
  RefreshCw,
  ListTodo,
} from "lucide-react";
import isotipoGold from "@/assets/brand/isotipo-s-framed-gold.png";
import patternCirclesGold from "@/assets/brand/pattern-circles-gold.png";
import { AdminNotificationBell } from "./AdminNotificationBell";
import { PendingMissionsBadge } from "./PendingMissionsBadge";
import { PendingTasksBadge } from "./tasks/PendingTasksBadge";
import { CommandPalette } from "./CommandPalette";
import { QuickActionsCenter } from "./QuickActionsCenter";
import { QuickEnrollDialog } from "./QuickEnrollDialog";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";
import { DensityToggle } from "./DensityToggle";
import { NewLeadDialog } from "./NewLeadDialog";
import { BulkNotificationDialog } from "./BulkNotificationDialog";
import { APP_VERSION } from "@/App";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin", hasBadge: false },
  { icon: ListTodo, label: "Tarefas", href: "/admin/tasks", hasBadge: true, badgeType: "tasks" },
  { icon: BookOpen, label: "Cursos", href: "/admin/courses", hasBadge: false },
  { icon: Target, label: "Agentes IA", href: "/admin/agents", hasBadge: false },
  { icon: FileText, label: "Blog", href: "/admin/blog", hasBadge: false },
  { icon: Users, label: "Alunos", href: "/admin/students", hasBadge: false },
  { icon: UserCheck, label: "Matrículas", href: "/admin/enrollments", hasBadge: false },
  { icon: Target, label: "Leads", href: "/admin/leads", hasBadge: false },
  { icon: ClipboardCheck, label: "Revisar Missões", href: "/admin/mission-reviews", hasBadge: true, badgeType: "missions" },
  { icon: Mail, label: "Comunicação", href: "/admin/messaging", hasBadge: false },
  { icon: Activity, label: "Engajamento", href: "/admin/engagement", hasBadge: false },
  { icon: Bell, label: "Notificações", href: "/admin/notifications", hasBadge: false },
  { icon: Users, label: "Comunidade", href: "/admin/community", hasBadge: false },
  { icon: BarChart3, label: "Relatórios", href: "/admin/reports", hasBadge: false },
  { icon: Settings, label: "Configurações", href: "/admin/settings", hasBadge: false },
];

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Quick action dialogs
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [showBulkNotificationDialog, setShowBulkNotificationDialog] = useState(false);
  const [showCreateStudentDialog, setShowCreateStudentDialog] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };
  
  const handleQuickAction = (action: string) => {
    switch (action) {
      case "create-student":
        // Navigate to students page where the create dialog can be opened
        navigate("/admin/students?action=create");
        break;
      case "create-lead":
        setShowNewLeadDialog(true);
        break;
      case "enroll-student":
        setShowEnrollDialog(true);
        break;
      case "bulk-notification":
        setShowBulkNotificationDialog(true);
        break;
    }
  };

  return (
    <div 
      className="min-h-screen bg-background font-admin admin-light-theme"
      style={{
        "--admin-sidebar-offset": isSidebarOpen ? "208px" : "64px"
      } as React.CSSProperties}
    >
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-b border-secondary/20 shadow-sm p-4 z-50 flex items-center justify-between">
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
        <div className="flex items-center gap-1">
          {/* Search shortcut button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            className="text-muted-foreground"
          >
            <Search className="w-5 h-5" />
          </Button>
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
        <div className="lg:hidden fixed inset-0 bg-card z-40 pt-16">
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
                <span className="flex-1">{item.label}</span>
                {item.hasBadge && item.badgeType === "missions" && <PendingMissionsBadge />}
                {item.hasBadge && item.badgeType === "tasks" && <PendingTasksBadge />}
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
          "hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-gradient-to-b from-card to-[hsl(30,20%,98%)] border-r border-secondary/20 shadow-sm transition-all duration-300 z-50 overflow-hidden",
          isSidebarOpen ? "w-52" : "w-16"
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
        <div className="relative p-3 border-b border-secondary/15">
          {/* Linha 1: Logo e texto + botão colapsar */}
          <div className={cn("flex items-center gap-2", !isSidebarOpen && "justify-center")}>
            <img src={isotipoGold} alt="Soberana" className="w-9 h-9 flex-shrink-0 drop-shadow-[0_0_10px_rgba(166,144,97,0.3)]" />
            
            {isSidebarOpen && (
              <>
                <div className="flex flex-col leading-tight flex-1 min-w-0">
                  <span className="text-muted-foreground text-[8px] tracking-[0.15em] uppercase">
                    Mentoring Club
                  </span>
                  <span className="font-serif font-bold text-secondary text-xs tracking-wider">
                    SOBERANA
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-muted-foreground hover:text-secondary hover:bg-secondary/10 h-7 w-7 flex-shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              </>
            )}
            
            {!isSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary hover:bg-secondary/10 h-7 w-7"
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          {/* Linha 2: Botões de ação (apenas quando expandido) */}
          {isSidebarOpen && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-secondary/10">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
                className="text-muted-foreground hover:text-secondary hover:bg-secondary/10 h-7 w-7"
                title="Buscar (⌘K)"
              >
                <Search className="w-4 h-4" />
              </Button>
              <DensityToggle />
              <AdminNotificationBell />
            </div>
          )}
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
              {isSidebarOpen && <span className="flex-1">{item.label}</span>}
              {isSidebarOpen && item.hasBadge && item.badgeType === "missions" && <PendingMissionsBadge />}
              {isSidebarOpen && item.hasBadge && item.badgeType === "tasks" && <PendingTasksBadge />}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="relative p-4 border-t border-secondary/15 space-y-2">
          {/* Force Update Button */}
          <button
            onClick={() => navigate('/clear-cache')}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-lg w-full text-muted-foreground hover:bg-secondary/10 hover:text-secondary transition-colors",
              !isSidebarOpen && "justify-center px-2"
            )}
            title="Forçar atualização do app"
          >
            <RefreshCw className="w-4 h-4" />
            {isSidebarOpen && <span className="text-sm">Atualizar</span>}
          </button>
          
          {/* Logout */}
          <button
            onClick={handleSignOut}
            className={cn(
              "flex items-center gap-3 px-4 py-2 rounded-lg w-full text-muted-foreground hover:bg-red-500/10 hover:text-red-400 transition-colors",
              !isSidebarOpen && "justify-center px-2"
            )}
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Sair</span>}
          </button>
          
          {/* Version indicator */}
          {isSidebarOpen && (
            <div className="text-center pt-2 border-t border-secondary/10">
              <span className="text-[10px] text-muted-foreground/50">v{APP_VERSION}</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen transition-all duration-300 pt-16 lg:pt-0",
          isSidebarOpen ? "lg:ml-52" : "lg:ml-16"
        )}
      >
        <div className="p-4 lg:p-6">
          <AdminBreadcrumbs />
          {children}
        </div>
      </main>
      
      {/* Command Palette */}
      <CommandPalette onQuickAction={handleQuickAction} />
      
      {/* Quick Actions FAB */}
      <QuickActionsCenter
        onCreateStudent={() => navigate("/admin/students?action=create")}
        onCreateLead={() => setShowNewLeadDialog(true)}
        onEnrollStudent={() => setShowEnrollDialog(true)}
        onBulkNotification={() => setShowBulkNotificationDialog(true)}
      />
      
      {/* Dialogs */}
      <NewLeadDialog 
        open={showNewLeadDialog} 
        onOpenChange={setShowNewLeadDialog}
        onSuccess={() => {
          setShowNewLeadDialog(false);
        }}
      />
      
      <QuickEnrollDialog 
        open={showEnrollDialog} 
        onOpenChange={setShowEnrollDialog} 
      />
      
      {showBulkNotificationDialog && (
        <BulkNotificationDialog />
      )}
    </div>
  );
};
