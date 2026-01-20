import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Must match APP_VERSION in App.tsx
const LOCAL_VERSION = '2026.01.20.1';
const CHECK_INTERVAL = 30000; // 30 seconds (more aggressive)

export const VersionChecker = () => {
  const [newVersionAvailable, setNewVersionAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        // Add timestamp to bypass cache
        const response = await fetch(`/version.json?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        
        if (data.version && data.version !== LOCAL_VERSION) {
          console.log(`Nova versão disponível: ${data.version} (atual: ${LOCAL_VERSION})`);
          setNewVersionAvailable(true);
        }
      } catch (error) {
        // Silently fail - network issues shouldn't break the app
        console.log('Erro ao verificar versão:', error);
      }
    };

    // Check immediately on mount
    checkVersion();

    // Then check periodically
    const interval = setInterval(checkVersion, CHECK_INTERVAL);

    // Also check when window gains focus (user returns to tab)
    const handleFocus = () => checkVersion();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }

      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }

      // Clear version from localStorage
      localStorage.removeItem('soberana_app_version');

      // Force reload from server
      window.location.reload();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      window.location.reload();
    }
  };

  if (!newVersionAvailable) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[9999] animate-in slide-in-from-bottom-4">
      <div className="bg-secondary text-secondary-foreground rounded-xl shadow-2xl p-4 border border-secondary/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary-foreground/20 rounded-lg">
            <RefreshCw className={`w-5 h-5 ${isUpdating ? 'animate-spin' : ''}`} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Nova versão disponível!</p>
            <p className="text-xs opacity-80">Clique para atualizar o app</p>
          </div>
          <Button
            onClick={handleUpdate}
            disabled={isUpdating}
            size="sm"
            className="bg-secondary-foreground text-secondary hover:bg-secondary-foreground/90"
          >
            {isUpdating ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </div>
    </div>
  );
};
