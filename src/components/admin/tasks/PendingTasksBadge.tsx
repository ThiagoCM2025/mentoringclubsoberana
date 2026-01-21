import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function PendingTasksBadge() {
  const [count, setCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchCount = async () => {
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const { count: taskCount } = await supabase
        .from("admin_tasks")
        .select("*", { count: "exact", head: true })
        .eq("assigned_to", user.id)
        .in("status", ["pending", "in_progress"])
        .lte("due_date", today.toISOString());

      setCount(taskCount || 0);
    };

    fetchCount();

    // Subscribe to changes
    const channel = supabase
      .channel("tasks_badge")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "admin_tasks" },
        () => fetchCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (count === 0) return null;

  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs font-medium text-destructive-foreground">
      {count > 9 ? "9+" : count}
    </span>
  );
}
