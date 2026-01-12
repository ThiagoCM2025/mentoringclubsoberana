import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Home, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Known routes that might have URL variations
const KNOWN_ROUTES: Record<string, string> = {
  'jornada': '/jornada-imobiliaria-2026',
  'jornada-imobiliaria': '/jornada-imobiliaria-2026',
  'operacao': '/operacao-regularizacao',
  'regularizacao': '/operacao-regularizacao',
  'experience': '/experience-start',
  'experiencestart': '/experience-start',
  'mentoria': '/programa/mentoria-360',
  'aceleracao': '/programa/aceleracao',
  'elite': '/programa/elite',
  'workshop': '/programa/workshop-ia',
};

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);
  const [targetRoute, setTargetRoute] = useState<string | null>(null);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    
    // Try to find a matching known route
    const pathLower = location.pathname.toLowerCase().replace(/[/-]/g, '');
    
    for (const [key, route] of Object.entries(KNOWN_ROUTES)) {
      if (pathLower.includes(key.replace(/-/g, ''))) {
        setTargetRoute(route);
        setRedirecting(true);
        
        // Auto-redirect after a short delay
        const timer = setTimeout(() => {
          navigate(route, { replace: true });
        }, 1500);
        
        return () => clearTimeout(timer);
      }
    }
  }, [location.pathname, navigate]);

  const handleRetry = () => {
    // Clear service worker cache and reload
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister();
        });
      });
    }
    
    // Clear caches
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }
    
    // Reload the page
    window.location.reload();
  };

  if (redirecting && targetRoute) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4 p-8">
          <div className="animate-spin mx-auto w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
          <p className="text-muted-foreground">
            Redirecionando para a página correta...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">
            Página não encontrada
          </h2>
          <p className="text-muted-foreground">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p className="font-mono break-all">{location.pathname}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          
          <Button asChild className="gap-2">
            <Link to="/">
              <Home className="w-4 h-4" />
              Ir para o Início
            </Link>
          </Button>
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">
            Se o problema persistir, tente limpar o cache:
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-4 h-4" />
            Limpar cache e recarregar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
