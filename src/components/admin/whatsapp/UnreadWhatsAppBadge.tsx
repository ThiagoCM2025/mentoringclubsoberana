import { useUnreadWhatsAppCount } from "@/hooks/useUnreadWhatsAppCount";
import { Badge } from "@/components/ui/badge";

export function UnreadWhatsAppBadge() {
  const unreadCount = useUnreadWhatsAppCount();

  if (unreadCount === 0) return null;

  return (
    <Badge 
      variant="destructive" 
      className="h-5 min-w-5 flex items-center justify-center p-0 text-xs"
    >
      {unreadCount > 99 ? "99+" : unreadCount}
    </Badge>
  );
}
