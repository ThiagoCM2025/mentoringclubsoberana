import { useState, useEffect } from "react";
import { Bell, Users, Target, UserCheck, MessageSquare, Check, CheckCheck, ShieldCheck, ClipboardCheck, MessageCircle, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useWhatsAppSound } from "@/hooks/useWhatsAppSound";

interface AdminNotification {
  id: string;
  event_type: string;
  title: string;
  message: string;
  metadata: any;
  read: boolean;
  created_at: string;
}

const EVENT_ICONS: Record<string, any> = {
  new_student: Users,
  new_lead: Target,
  new_enrollment: UserCheck,
  community_post: MessageSquare,
  new_admin: ShieldCheck,
  mission_submission: ClipboardCheck,
  whatsapp_message: MessageCircle
};

const EVENT_COLORS: Record<string, string> = {
  new_student: "bg-emerald-100 text-emerald-600",
  new_lead: "bg-pink-100 text-pink-600",
  new_enrollment: "bg-violet-100 text-violet-600",
  community_post: "bg-blue-100 text-blue-600",
  new_admin: "bg-red-100 text-red-600",
  mission_submission: "bg-amber-100 text-amber-600",
  whatsapp_message: "bg-green-100 text-green-600"
};

export function AdminNotificationBell() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const stored = localStorage.getItem('admin_notification_sound');
    return stored !== 'false'; // Default to true
  });
  const { playNotification } = useWhatsAppSound();

  useEffect(() => {
    fetchNotifications();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications'
        },
        (payload) => {
          const newNotification = payload.new as AdminNotification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Play sound for all notification types when enabled
          if (soundEnabled) {
            playNotification();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [soundEnabled, playNotification]);

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('admin_notification_sound', String(newValue));
  };

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    }
    setLoading(false);
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from("admin_notifications")
      .update({ read: true })
      .eq("id", id);

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    await supabase
      .from("admin_notifications")
      .update({ read: true })
      .in("id", unreadIds);

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getIcon = (eventType: string) => {
    const Icon = EVENT_ICONS[eventType] || Bell;
    return Icon;
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSound}
        className="relative text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8"
        title={soundEnabled ? "Som ativado - clique para desativar" : "Som desativado - clique para ativar"}
      >
        {soundEnabled ? (
          <Volume2 className="w-4 h-4" />
        ) : (
          <VolumeX className="w-4 h-4 opacity-50" />
        )}
      </Button>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-500 text-white border-0"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="w-4 h-4 mr-1" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => {
                const Icon = getIcon(notification.event_type);
                const colorClass = EVENT_COLORS[notification.event_type] || "bg-gray-100 text-gray-600";
                
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-3 p-4 hover:bg-muted/50 cursor-pointer transition-colors",
                      !notification.read && "bg-primary/5"
                    )}
                    onClick={() => !notification.read && markAsRead(notification.id)}
                  >
                    <div className={cn("w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0", colorClass)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
      </Popover>
    </div>
  );
}
