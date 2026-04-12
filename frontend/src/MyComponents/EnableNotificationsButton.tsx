import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "./AuthContext";
import { useState, useEffect } from "react";

const BASE_URL = import.meta.env.VITE_API_URL;
const PUBLIC_VAPID_KEY = "BNKAmDfTaQPF3GzXN7KQFPHBh3_hT4YiVRAcQ47WDXTQuRW2zkWO-RyBPcn__OGbSQ7bAH7XA-awA1UHv4yRO1I";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from([...atob(b64)].map((c) => c.charCodeAt(0)));
}

function isPushSupported(): boolean {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function EnableNotificationsButton() {
  const { token } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pushSupported, setPushSupported] = useState(true);

  useEffect(() => {
    if (!isPushSupported()) {
      setPushSupported(false);
      setLoading(false);
      return;
    }

    async function checkStatus() {
      if (!token) {
        setIsSubscribed(false);
        setLoading(false);
        return;
      }

      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();

        if (!sub) {
          // No subscription in this browser at all
          setIsSubscribed(false);
          setLoading(false);
          return;
        }

        // Only CHECK if this subscription belongs to the current user
        // Never reassign it — that's what was causing the bug
        const res = await fetch(`${BASE_URL}/api/notifications/subscription-status/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`,
          },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        const data = await res.json();
        setIsSubscribed(data.subscribed);
      } catch {
        setIsSubscribed(false);
        setPushSupported(false);
      } finally {
        setLoading(false);
      }
    }

    checkStatus();
  }, [token]);

  async function handleToggle() {
    if (!isPushSupported()) return;

    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;

      if (isSubscribed) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch(`${BASE_URL}/api/notifications/unsubscribe/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Token ${token}`,
            },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
        setIsSubscribed(false);
        return;
      }

      // Subscribe flow — this is the ONLY place we assign a subscription to a user
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
      });

      await fetch(`${BASE_URL}/api/notifications/subscribe/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${token}`,
        },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });
      setIsSubscribed(true);
    } catch {
      setPushSupported(false);
    } finally {
      setLoading(false);
    }
  }

  if (!pushSupported) return null;
  if (loading) return <div className="w-10 h-10" />;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      title={isSubscribed ? "Notifications active" : "Enable notifications"}
    >
      <Bell className={`w-5 h-5 ${isSubscribed ? "text-emerald-500" : "text-gray-400"}`} />
    </Button>
  );
}