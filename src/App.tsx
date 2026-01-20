import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { AnimatedRoutes } from "@/components/AnimatedRoutes";
import { Analytics } from "@/components/Analytics";
import { CookieBanner } from "@/components/CookieBanner";
import ScrollToTop from "@/components/ScrollToTop";
import { PWAUpdatePrompt } from "@/components/PWAUpdatePrompt";
import { VersionChecker } from "@/components/VersionChecker";

const queryClient = new QueryClient();

// Version for cache busting - increment on each significant deploy
// IMPORTANT: Also update public/version.json and src/components/VersionChecker.tsx
export const APP_VERSION = '2026.01.20.1';

// Detecta WebView do Instagram/Facebook para evitar problemas de cache
const isInAppBrowser = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return /FBAN|FBAV|Instagram|Twitter|LinkedInApp|Line\//i.test(ua);
};

const CacheManager = () => {
  useEffect(() => {
    // Pula lógica de cache em WebViews problemáticos (Instagram, Facebook, etc.)
    if (isInAppBrowser()) {
      console.log('WebView detectado, pulando lógica de cache');
      return;
    }

    const storedVersion = localStorage.getItem('soberana_app_version');
    
    if (storedVersion && storedVersion !== APP_VERSION) {
      console.log('Nova versão detectada, limpando cache antigo...');
      
      // Clear all caches
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            console.log('Deletando cache:', name);
            caches.delete(name);
          });
        });
      }
      
      // Unregister old service workers
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(reg => {
            console.log('Unregistering SW:', reg.scope);
            reg.unregister();
          });
        });
      }
      
      // Update stored version
      localStorage.setItem('soberana_app_version', APP_VERSION);
      
      // Force reload after cleanup
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else if (!storedVersion) {
      localStorage.setItem('soberana_app_version', APP_VERSION);
    }
  }, []);

  return null;
};

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <CacheManager />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Analytics />
            <AnimatedRoutes />
            <CookieBanner />
            <PWAUpdatePrompt />
            <VersionChecker />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
