"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "../lib/client";

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
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() - 1);
  return localDateStr(d);
}

function computeStats(days: DayRecord[]) {
  const today = todayStr();
  const todayCount = days.find((d) => d.date === today)?.count ?? 0;

  const sevenDaysAgo = localDateStr(
    new Date(new Date().setDate(new Date().getDate() - 7)),
  );
  const weeklyCount = days
    .filter((d) => d.date >= sevenDaysAgo)
    .reduce((s, d) => s + d.count, 0);

  const totalCount = days.reduce((s, d) => s + d.count, 0);
  const bestDay = days.reduce((best, d) => Math.max(best, d.count), 0);

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
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data: userData }) => {
      const uid = userData.user?.id;
      if (!uid) {
        setLoaded(true);
        return;
      }

      const { data: rows } = await supabase
        .from("pomodoro_sessions")
        .select("date, count")
        .eq("user_id", uid);

      if (rows) {
        setData({ days: rows.map((r) => ({ date: r.date, count: r.count })) });
      }
      setLoaded(true);
    });
  }, []);

  const recordSession = useCallback(() => {
    const today = todayStr();

    // Optimistic update
    setData((prev) => {
      const existing = prev.days.find((d) => d.date === today);
      const newDays: DayRecord[] = existing
        ? prev.days.map((d) =>
            d.date === today ? { ...d, count: d.count + 1 } : d,
          )
        : [...prev.days, { date: today, count: 1 }];
      return { days: newDays };
    });

    // Persist — upsert the incremented count
    (async () => {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) return;

      // Read current DB value to avoid a race if multiple tabs are open
      const { data: existing } = await supabase
        .from("pomodoro_sessions")
        .select("count")
        .eq("user_id", uid)
        .eq("date", today)
        .single();

      await supabase.from("pomodoro_sessions").upsert({
        user_id: uid,
        date: today,
        count: (existing?.count ?? 0) + 1,
      });
    })();
  }, []);

  return { stats: computeStats(data.days), recordSession, loaded };
}
