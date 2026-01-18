import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Loader2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import isotipoGold from "@/assets/brand/isotipo-s-framed-gold.png";

interface Step {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'done';
}

const ClearCache = () => {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<Step[]>([
    { id: 'caches', label: 'Limpando caches do navegador...', status: 'pending' },
    { id: 'sw', label: 'Removendo Service Workers...', status: 'pending' },
    { id: 'storage', label: 'Limpando armazenamento local...', status: 'pending' },
    { id: 'reload', label: 'Preparando recarregamento...', status: 'pending' },
  ]);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const clearAll = async () => {
      // Step 1: Clear all caches
      setSteps(prev => prev.map(s => s.id === 'caches' ? { ...s, status: 'running' } : s));
      try {
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          await Promise.all(cacheNames.map(name => {
            console.log('Deletando cache:', name);
            return caches.delete(name);
          }));
        }
      } catch (e) {
        console.error('Erro ao limpar caches:', e);
      }
      setSteps(prev => prev.map(s => s.id === 'caches' ? { ...s, status: 'done' } : s));
      await new Promise(r => setTimeout(r, 500));

      // Step 2: Unregister service workers
      setSteps(prev => prev.map(s => s.id === 'sw' ? { ...s, status: 'running' } : s));
      try {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map(reg => {
            console.log('Removendo SW:', reg.scope);
            return reg.unregister();
          }));
        }
      } catch (e) {
        console.error('Erro ao remover service workers:', e);
      }
      setSteps(prev => prev.map(s => s.id === 'sw' ? { ...s, status: 'done' } : s));
      await new Promise(r => setTimeout(r, 500));

      // Step 3: Clear localStorage version
      setSteps(prev => prev.map(s => s.id === 'storage' ? { ...s, status: 'running' } : s));
      try {
        localStorage.removeItem('soberana_app_version');
        sessionStorage.removeItem('soberana_visited');
      } catch (e) {
        console.error('Erro ao limpar storage:', e);
      }
      setSteps(prev => prev.map(s => s.id === 'storage' ? { ...s, status: 'done' } : s));
      await new Promise(r => setTimeout(r, 500));

      // Step 4: Prepare reload
      setSteps(prev => prev.map(s => s.id === 'reload' ? { ...s, status: 'running' } : s));
      await new Promise(r => setTimeout(r, 500));
      setSteps(prev => prev.map(s => s.id === 'reload' ? { ...s, status: 'done' } : s));
      
      setIsComplete(true);

      // Redirect after showing success
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    };

    clearAll();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl shadow-xl border border-secondary/20 p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <img 
            src={isotipoGold} 
            alt="Soberana" 
            className="w-16 h-16 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(166,144,97,0.4)]" 
          />
          <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
            Limpeza de Cache
          </h1>
          <p className="text-muted-foreground text-sm">
            Removendo dados antigos para garantir a versão mais recente...
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                {step.status === 'pending' && (
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                )}
                {step.status === 'running' && (
                  <Loader2 className="w-5 h-5 text-secondary animate-spin" />
                )}
                {step.status === 'done' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <span className={`text-sm ${
                step.status === 'done' ? 'text-foreground' : 
                step.status === 'running' ? 'text-secondary' : 
                'text-muted-foreground'
              }`}>
                {step.label}
              </span>
            </motion.div>
          ))}
        </div>

        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center"
          >
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-green-600 font-medium">Cache limpo com sucesso!</p>
            <p className="text-sm text-muted-foreground mt-1">Redirecionando...</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ClearCache;
