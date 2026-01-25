"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_PUSH_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Check push support synchronously (during hydration)
function getIsSupported() {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window;
}

function subscribe() {
  return () => { };
}

export function usePushNotifications() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  // Use useSyncExternalStore for SSR-safe browser feature detection
  const isSupported = useSyncExternalStore(subscribe, getIsSupported, () => false);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      const sub = await registration.pushManager.getSubscription();
      setSubscription(sub);
    } catch (error) {
      console.error("Service Worker registration failed:", error);
    }
  }

  async function subscribeToPush() {
    if (!isSupported || !VAPID_PUBLIC_KEY) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Send to backend
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub }),
      });

      setSubscription(sub);
    } catch (error) {
      console.error("Failed to subscribe:", error);
    }
  }

  useEffect(() => {
    if (isSupported) {
      // Async state update from external system (service worker) is the intended pattern
      // eslint-disable-next-line react-hooks/set-state-in-effect
      registerServiceWorker();
    }
  }, [isSupported]);

  return { isSupported, subscription, subscribeToPush };
}

