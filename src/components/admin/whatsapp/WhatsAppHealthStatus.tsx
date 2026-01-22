import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Wifi, WifiOff, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface ConnectionStatus {
  connected: boolean;
  canSend: boolean;
  hourlyRemaining: number;
  dailyRemaining: number;
  hourlyLimit: number;
  dailyLimit: number;
  lastSync?: string;
}

export function WhatsAppHealthStatus() {
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-whatsapp-status");
      
      if (error) throw error;
      
      setStatus({
        connected: data?.connected ?? false,
        canSend: data?.canSend ?? false,
        hourlyRemaining: data?.hourlyRemaining ?? 0,
        dailyRemaining: data?.dailyRemaining ?? 0,
        hourlyLimit: data?.hourlyLimit ?? 25,
        dailyLimit: data?.dailyLimit ?? 100,
        lastSync: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Erro ao verificar status:", error);
      setStatus({
        connected: false,
        canSend: false,
        hourlyRemaining: 0,
        dailyRemaining: 0,
        hourlyLimit: 25,
        dailyLimit: 100,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [checkStatus]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await checkStatus();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <div className="h-4 w-32 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hourlyPercent = status ? (status.hourlyRemaining / status.hourlyLimit) * 100 : 0;
  const dailyPercent = status ? (status.dailyRemaining / status.dailyLimit) * 100 : 0;

  return (
    <Card className={cn(
      "border-2 transition-colors",
      status?.connected 
        ? "bg-emerald-500/5 border-emerald-500/20" 
        : "bg-destructive/5 border-destructive/20"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Connection Status */}
          <div className="flex items-center gap-3">
            {status?.connected ? (
              <>
                <div className="relative">
                  <Wifi className="w-5 h-5 text-emerald-500" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <span className="font-medium text-emerald-600">WhatsApp Conectado</span>
                  {status.lastSync && (
                    <p className="text-xs text-muted-foreground">
                      Última verificação: {new Date(status.lastSync).toLocaleTimeString('pt-BR')}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-destructive" />
                <div>
                  <span className="font-medium text-destructive">Desconectado</span>
                  <p className="text-xs text-muted-foreground">
                    Verifique a Evolution API
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Rate Limits */}
          {status?.connected && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Hora:</span>
                <Badge 
                  variant={hourlyPercent > 30 ? "secondary" : "destructive"}
                  className="font-mono"
                >
                  {status.hourlyRemaining}/{status.hourlyLimit}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Dia:</span>
                <Badge 
                  variant={dailyPercent > 30 ? "secondary" : "destructive"}
                  className="font-mono"
                >
                  {status.dailyRemaining}/{status.dailyLimit}
                </Badge>
              </div>
              
              {!status.canSend && (
                <div className="flex items-center gap-1 text-amber-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">Limite atingido</span>
                </div>
              )}
            </div>
          )}

          {/* Refresh Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={cn("w-4 h-4", refreshing && "animate-spin")} />
            Verificar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
