import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export function PendingMissionsBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchPendingCount();
    
    // Realtime subscription para atualizações
    const channel = supabase
      .channel('pending-missions-badge')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_mission_completions'
        },
        () => fetchPendingCount()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingCount = async () => {
    const { count } = await supabase
      .from('user_mission_completions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'submitted');
    
    setCount(count || 0);
  };

  if (count === 0) return null;

  return (
    <Badge className="ml-auto bg-amber-500 hover:bg-amber-500 text-white text-xs px-1.5 py-0.5 min-w-[20px] flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </Badge>
  );
}
