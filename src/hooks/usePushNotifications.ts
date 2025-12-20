import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

const VAPID_PUBLIC_KEY = "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U";

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission | "default";
}

export const usePushNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    permission: "default",
  });

  useEffect(() => {
    checkSupport();
  }, [user]);

  const checkSupport = async () => {
    const isSupported = "serviceWorker" in navigator && "PushManager" in window;
    
    if (!isSupported) {
      setState(prev => ({ ...prev, isSupported: false, isLoading: false }));
      return;
    }

    const permission = Notification.permission;
    let isSubscribed = false;

    if (user && permission === "granted") {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        isSubscribed = !!subscription;
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    }

    setState({
      isSupported: true,
      isSubscribed,
      isLoading: false,
      permission,
    });
  };

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = useCallback(async () => {
    if (!user || !state.isSupported) return false;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const permission = await Notification.requestPermission();
      
      if (permission !== "granted") {
        setState(prev => ({ ...prev, permission, isLoading: false }));
        toast({
          title: "Permissão negada",
          description: "Você precisa permitir notificações para receber lembretes.",
          variant: "destructive",
        });
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subscriptionJson = subscription.toJSON();
      
      // Save subscription to database
      const { error } = await supabase
        .from("push_subscriptions")
        .upsert({
          user_id: user.id,
          endpoint: subscriptionJson.endpoint!,
          p256dh: subscriptionJson.keys!.p256dh!,
          auth: subscriptionJson.keys!.auth!,
        }, {
          onConflict: "user_id,endpoint",
        });

      if (error) {
        console.error("Error saving subscription:", error);
        throw error;
      }

      setState(prev => ({ 
        ...prev, 
        isSubscribed: true, 
        permission: "granted",
        isLoading: false 
      }));

      toast({
        title: "Notificações ativadas! 🔔",
        description: "Você receberá lembretes de estudo e novidades.",
      });

      return true;
    } catch (error) {
      console.error("Error subscribing to push:", error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast({
        title: "Erro",
        description: "Não foi possível ativar as notificações.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, state.isSupported, toast]);

  const unsubscribe = useCallback(async () => {
    if (!user) return false;

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        
        // Remove from database
        await supabase
          .from("push_subscriptions")
          .delete()
          .eq("user_id", user.id)
          .eq("endpoint", subscription.endpoint);
      }

      setState(prev => ({ 
        ...prev, 
        isSubscribed: false, 
        isLoading: false 
      }));

      toast({
        title: "Notificações desativadas",
        description: "Você não receberá mais lembretes.",
      });

      return true;
    } catch (error) {
      console.error("Error unsubscribing:", error);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, [user, toast]);

  return {
    ...state,
    subscribe,
    unsubscribe,
  };
};
