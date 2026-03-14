"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "pomodoro-sessions";

interface DayRecord {
  date: string; // "YYYY-MM-DD"
  count: number;
}

interface SessionData {
  days: DayRecord[];
}

function localDateStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayStr() {
  return localDateStr();
}

// Subtract one calendar day from a "YYYY-MM-DD" string using local time
function prevDay(dateStr: string) {
  // Parse at noon local time to avoid DST edge cases
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() - 1);
  return localDateStr(d);
}

function computeStats(days: DayRecord[]) {
  const today = todayStr();
  const todayCount = days.find((d) => d.date === today)?.count ?? 0;

  // Last 7 days including today — compare as date strings (both local)
  const sevenDaysAgo = localDateStr(new Date(new Date().setDate(new Date().getDate() - 7)));
  const weeklyCount = days
    .filter((d) => d.date >= sevenDaysAgo)
    .reduce((s, d) => s + d.count, 0);

  const totalCount = days.reduce((s, d) => s + d.count, 0);

  const bestDay = days.reduce((best, d) => Math.max(best, d.count), 0);

  // Streak: consecutive days ending today (or yesterday if today has 0)
  const sorted = [...days].sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  const yesterday = prevDay(today);
  const anchor =
    todayCount > 0
      ? today
      : days.find((d) => d.date === yesterday)
      ? yesterday
      : null;

  if (anchor) {
    let expected = anchor;
    for (const day of sorted) {
      if (day.date === expected && day.count > 0) {
        streak++;
        expected = prevDay(expected);
      } else if (day.date < expected) {
        break;
      }
    }
  }

  return { todayCount, weeklyCount, totalCount, bestDay, streak };
}

export function useSessionStats() {
  const [data, setData] = useState<SessionData>({ days: [] });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setData(raw ? JSON.parse(raw) : { days: [] });
    } catch {
      setData({ days: [] });
    }
    setLoaded(true);
  }, []);

  const recordSession = useCallback(() => {
    setData((prev) => {
      const today = todayStr();
      const existing = prev.days.find((d) => d.date === today);
      const newDays: DayRecord[] = existing
        ? prev.days.map((d) =>
            d.date === today ? { ...d, count: d.count + 1 } : d
          )
        : [...prev.days, { date: today, count: 1 }];
      const next = { days: newDays };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // storage full or unavailable
      }
      return next;
    });
  }, []);

  return { stats: computeStats(data.days), recordSession, loaded };
}
