"use client";

import { useState, useEffect, useCallback } from "react";

export interface Settings {
  workDuration: number; // minutes
  shortBreak: number; // minutes
  longBreak: number; // minutes
  autoStart: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  workDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  autoStart: false,
};

const STORAGE_KEY = "pomodoro-settings";

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {
      // ignore malformed storage
    }
    setLoaded(true);
  }, []);

  const save = useCallback((next: Settings) => {
    setSettings(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors
    }
  }, []);

  return { settings, save, loaded };
}
