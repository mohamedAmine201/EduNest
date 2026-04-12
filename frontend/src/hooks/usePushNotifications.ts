import { useEffect } from "react";
import { useAuth } from "@/MyComponents/AuthContext";

const BASE_URL = import.meta.env.VITE_API_URL;

export function usePushNotifications() {
  const { token } = useAuth();

  useEffect(() => {
    if (!token || Notification.permission !== "granted") return;
    if (!("serviceWorker" in navigator)) return;

    async function resync() {
      const reg = await navigator.serviceWorker.register("/sw.js");
      const existing = await reg.pushManager.getSubscription();
      if (!existing) return;

      await fetch(`${BASE_URL}/api/notifications/subscribe/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`,
        },
        body: JSON.stringify({ subscription: existing.toJSON() }),
      });
    }

    resync().catch(console.error);
  }, [token]);
}