import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { Bell, BellOff, X } from "lucide-react";

interface PushNotificationPromptProps {
  showOnMount?: boolean;
}

const PushNotificationPrompt = ({ showOnMount = true }: PushNotificationPromptProps) => {
  const { isSupported, isSubscribed, isLoading, permission, subscribe, unsubscribe } = usePushNotifications();
  const [dismissed, setDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Show prompt after a delay if not already subscribed and hasn't been dismissed
    if (showOnMount && isSupported && !isSubscribed && permission !== "denied") {
      const dismissedBefore = localStorage.getItem("push_prompt_dismissed");
      if (!dismissedBefore) {
        const timer = setTimeout(() => setShowPrompt(true), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isSupported, isSubscribed, permission, showOnMount]);

  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
    localStorage.setItem("push_prompt_dismissed", "true");
  };

  const handleSubscribe = async () => {
    await subscribe();
    setShowPrompt(false);
  };

  if (!isSupported || dismissed || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-24 lg:bottom-8 left-4 right-4 lg:left-auto lg:right-8 lg:w-96 z-50"
      >
        <div className="bg-zinc-900 border border-secondary/30 rounded-2xl p-5 shadow-xl shadow-black/20">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-cream/50 hover:text-cream p-1"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
              <Bell className="w-6 h-6 text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-cream mb-1">
                Ative as notificações
              </h3>
              <p className="text-sm text-cream/70 mb-4">
                Receba lembretes de estudo e fique por dentro das novidades!
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  size="sm"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  {isLoading ? "Ativando..." : "Ativar"}
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="ghost"
                  size="sm"
                  className="text-cream/60 hover:text-cream"
                >
                  Agora não
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PushNotificationPrompt;
