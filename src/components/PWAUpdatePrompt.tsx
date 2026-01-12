import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export const PWAUpdatePrompt = () => {
  const [countdown, setCountdown] = useState(3);
  
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log('SW Registered:', swUrl);
      // Check for updates every 1 minute (more aggressive)
      if (r) {
        setInterval(() => {
          r.update();
        }, 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  // Auto-update after 3 seconds when new version detected
  useEffect(() => {
    if (!needRefresh) return;
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          updateServiceWorker(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [needRefresh, updateServiceWorker]);

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-auto">
      <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-background/95 p-4 shadow-lg backdrop-blur-sm">
        <RefreshCw className="h-5 w-5 text-primary animate-spin" />
        <div className="flex-1">
          <p className="text-sm font-medium">Atualização disponível</p>
          <p className="text-xs text-muted-foreground">
            Atualizando automaticamente em {countdown}s...
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => updateServiceWorker(true)}
          className="shrink-0"
        >
          Atualizar Agora
        </Button>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;
