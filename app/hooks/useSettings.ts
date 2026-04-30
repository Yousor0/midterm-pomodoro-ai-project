"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "../lib/client";

export interface Settings {
  workDuration: number; // minutes
  shortBreak: number;   // minutes
  longBreak: number;    // minutes
  autoStart: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  workDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  autoStart: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: userData }) => {
      const uid = userData.user?.id;
      if (!uid) { setLoaded(true); return; }

      const { data } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", uid)
        .single();

      if (data) {
        setSettings({
          workDuration: data.work_duration,
          shortBreak: data.short_break,
          longBreak: data.long_break,
          autoStart: data.auto_start,
        });
      }
      setLoaded(true);
    });
  }, []);

  const save = useCallback(async (next: Settings) => {
    setSettings(next);

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return;

    await supabase.from("user_settings").upsert({
      user_id: uid,
      work_duration: next.workDuration,
      short_break: next.shortBreak,
      long_break: next.longBreak,
      auto_start: next.autoStart,
      updated_at: new Date().toISOString(),
    });
  }, []);

  return { settings, save, loaded };
}
