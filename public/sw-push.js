// Service Worker for Push Notifications

self.addEventListener("install", (event) => {
  console.log("[SW Push] Service Worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("[SW Push] Service Worker activated");
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  console.log("[SW Push] Push received:", event);

  let data = {
    title: "Nova mensagem",
    body: "Você recebeu uma nova mensagem no WhatsApp",
    icon: "/pwa-192x192.png",
    badge: "/favicon.png",
    tag: "whatsapp-message",
    url: "/admin/leads",
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      data = {
        title: payload.title || data.title,
        body: payload.body || payload.message || data.body,
        icon: payload.icon || data.icon,
        badge: payload.badge || data.badge,
        tag: payload.tag || payload.conversationId || data.tag,
        url: payload.url || data.url,
        conversationId: payload.conversationId,
        phone: payload.phone,
      };
    }
  } catch (e) {
    console.error("[SW Push] Error parsing push data:", e);
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {
      url: data.url,
      conversationId: data.conversationId,
      phone: data.phone,
    },
    actions: [
      {
        action: "open",
        title: "Abrir",
      },
      {
        action: "dismiss",
        title: "Ignorar",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  console.log("[SW Push] Notification clicked:", event);

  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const urlToOpen = event.notification.data?.url || "/admin/leads";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Try to find an existing window/tab
      for (const client of clientList) {
        if (client.url.includes("/admin") && "focus" in client) {
          return client.focus().then((focusedClient) => {
            // Navigate to the correct page
            if (focusedClient && "navigate" in focusedClient) {
              return focusedClient.navigate(urlToOpen);
            }
          });
        }
      }
      // If no existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

self.addEventListener("notificationclose", (event) => {
  console.log("[SW Push] Notification closed:", event);
});
