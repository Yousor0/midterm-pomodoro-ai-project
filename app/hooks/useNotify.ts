"use client";

import { useCallback, useEffect, useState } from "react";

export type NotifyPermission = "default" | "granted" | "denied" | "unsupported";

export function useNotify() {
  const [permission, setPermission] = useState<NotifyPermission>("unsupported");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission as NotifyPermission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result as NotifyPermission);
  }, []);

  const notify = useCallback(
    (title: string, body: string) => {
      if (permission !== "granted") return;
      try {
        new Notification(title, { body, icon: "/favicon.ico" });
      } catch {
        // some browsers block programmatic notifications — ignore
      }
    },
    [permission]
  );

  return { permission, requestPermission, notify };
}
