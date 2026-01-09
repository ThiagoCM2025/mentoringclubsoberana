import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

export const PWAUpdatePrompt = () => {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log('SW Registered:', swUrl);
      // Check for updates every 5 minutes
      if (r) {
        setInterval(() => {
          r.update();
        }, 5 * 60 * 1000);
      }
    },
    onRegisterError(error) {
      console.error('SW registration error:', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-auto">
      <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-background/95 p-4 shadow-lg backdrop-blur-sm">
        <RefreshCw className="h-5 w-5 text-primary animate-spin" />
        <div className="flex-1">
          <p className="text-sm font-medium">Atualização disponível</p>
          <p className="text-xs text-muted-foreground">Clique para carregar a versão mais recente</p>
        </div>
        <Button
          size="sm"
          onClick={() => updateServiceWorker(true)}
          className="shrink-0"
        >
          Atualizar
        </Button>
      </div>
    </div>
  );
};

export default PWAUpdatePrompt;
