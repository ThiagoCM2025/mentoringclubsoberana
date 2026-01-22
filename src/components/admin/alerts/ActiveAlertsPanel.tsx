import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AlertTriangle, AlertCircle, Info, Check, Bell, Settings } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AlertRulesManager } from "./AlertRulesManager";
import { toBrazilISOString } from "@/lib/dateUtils";

interface AlertOccurrence {
  id: string;
  rule_id: string;
  entity_id: string | null;
  entity_type: string | null;
  message: string;
  severity: string;
  is_resolved: boolean;
  created_at: string;
  admin_alert_rules?: {
    name: string;
    alert_type: string;
  };
}

const severityIcons = {
  info: Info,
  warning: AlertCircle,
  critical: AlertTriangle,
};

const severityStyles = {
  info: "border-blue-500/50 bg-blue-500/10 text-blue-700",
  warning: "border-yellow-500/50 bg-yellow-500/10 text-yellow-700",
  critical: "border-red-500/50 bg-red-500/10 text-red-700",
};

export const ActiveAlertsPanel = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertOccurrence[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRulesManager, setShowRulesManager] = useState(false);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_alert_occurrences")
      .select("*, admin_alert_rules(name, alert_type)")
      .eq("is_resolved", false)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!error) {
      setAlerts(data || []);
    }
    setLoading(false);
  };

  const resolveAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from("admin_alert_occurrences")
        .update({
          is_resolved: true,
          resolved_by: user?.id,
          resolved_at: toBrazilISOString(),
        })
        .eq("id", alertId);

      if (error) throw error;
      fetchAlerts();
    } catch (error) {
      console.error("Error resolving alert:", error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Alertas Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Alertas Ativos
            {alerts.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {alerts.length}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRulesManager(true)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm">Nenhum alerta ativo</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => {
                const Icon = severityIcons[alert.severity as keyof typeof severityIcons] || Info;
                const style = severityStyles[alert.severity as keyof typeof severityStyles];

                return (
                  <div
                    key={alert.id}
                    className={`flex items-start justify-between p-3 rounded-lg border ${style}`}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{alert.message}</p>
                        <p className="text-xs opacity-75">
                          {format(new Date(alert.created_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => resolveAlert(alert.id)}
                      className="flex-shrink-0"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertRulesManager open={showRulesManager} onOpenChange={setShowRulesManager} />
    </>
  );
};
