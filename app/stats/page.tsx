"use client";

import TerminalChrome from "../components/TerminalChrome";
import { useSessionStats } from "../hooks/useSessionStats";

function StatRow({
  label,
  value,
  color = "var(--terminal-green)",
  sub,
}: {
  label: string;
  value: string | number;
  color?: string;
  sub?: string;
}) {
  return (
    <div className="flex items-baseline gap-3 text-sm font-mono">
      <span className="w-32 shrink-0" style={{ color: "var(--terminal-dim)" }}>{label}</span>
      <span style={{ color }}>{value}</span>
      {sub && <span className="text-xs opacity-60" style={{ color: "var(--terminal-dim)" }}>{sub}</span>}
    </div>
  );
}

export default function StatsPage() {
  const { stats, loaded } = useSessionStats();

  return (
    <TerminalChrome>
      <div className="space-y-6">
        <p className="text-xs" style={{ color: "var(--terminal-dim)" }}>$ sessions --stats --verbose</p>

        <div
          className="border rounded p-6 md:p-8 space-y-4"
          style={{
            borderColor: "var(--terminal-border)",
            backgroundColor: "var(--terminal-surface)",
          }}
        >
          {!loaded ? (
            <span className="text-xs opacity-60" style={{ color: "var(--terminal-dim)" }}>loading...</span>
          ) : (
            <>
              <StatRow
                label="today"
                value={stats.todayCount}
                sub={stats.todayCount === 1 ? "session" : "sessions"}
              />
              <StatRow
                label="this week"
                value={stats.weeklyCount}
                sub={stats.weeklyCount === 1 ? "session" : "sessions"}
              />
              <StatRow
                label="total"
                value={stats.totalCount}
                sub="all time"
              />
              <div
                className="border-t pt-4 space-y-4"
                style={{ borderColor: "var(--terminal-border)" }}
              >
                <StatRow
                  label="best day"
                  value={stats.bestDay}
                  color="var(--terminal-amber)"
                  sub={stats.bestDay === 1 ? "session" : "sessions"}
                />
                <StatRow
                  label="streak"
                  value={
                    stats.streak === 0
                      ? "—"
                      : `${stats.streak} day${stats.streak !== 1 ? "s" : ""}`
                  }
                  color={
                    stats.streak >= 3
                      ? "var(--terminal-amber)"
                      : "var(--terminal-cyan)"
                  }
                  sub={
                    stats.streak >= 7
                      ? "🔥 on fire"
                      : stats.streak >= 3
                      ? "keep it up"
                      : stats.streak > 0
                      ? "building momentum"
                      : undefined
                  }
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span style={{ color: "var(--terminal-cyan)" }}>user@pomodoro-terminal:~$</span>
          <span
            className="cursor-blink inline-block w-2.5 h-5"
            style={{ backgroundColor: "var(--terminal-green)" }}
          />
        </div>
      </div>
    </TerminalChrome>
  );
}
