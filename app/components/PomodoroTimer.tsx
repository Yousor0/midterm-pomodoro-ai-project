"use client";

import { useEffect, useReducer, useCallback, useRef, useState } from "react";
import { useSessionStats } from "../hooks/useSessionStats";
import { useSettings } from "../hooks/useSettings";
import { useTheme } from "../hooks/useTheme";
import { useNotify } from "../hooks/useNotify";
import { useAmbientSound } from "../hooks/useAmbientSound";
import TaskList from "./TaskList";
import SettingsPanel from "./Settings";
import NotifyPanel from "./NotifyPanel";
import { useAuth } from "../hooks/useAuth";

type Mode = "work" | "short" | "long";

const MODE_LABEL: Record<Mode, string> = {
  work: "FOCUS",
  short: "SHORT BREAK",
  long: "LONG BREAK",
};

// Dark-mode palette — bright phosphor colors
const MODE_COLOR_DARK: Record<Mode, string> = {
  work: "#33ff33",
  short: "#00ffff",
  long: "#ffb000",
};

// Light-mode palette — darker, readable versions of the same hues
const MODE_COLOR_LIGHT: Record<Mode, string> = {
  work: "#1a6b1a",
  short: "#007878",
  long: "#b86900",
};

const MODE_GLOW_DARK: Record<Mode, string> = {
  work: "0 0 10px rgba(51,255,51,0.6), 0 0 20px rgba(51,255,51,0.3)",
  short: "0 0 10px rgba(0,255,255,0.6), 0 0 20px rgba(0,255,255,0.3)",
  long: "0 0 10px rgba(255,176,0,0.6), 0 0 20px rgba(255,176,0,0.3)",
};

const MODE_GLOW_LIGHT: Record<Mode, string> = {
  work: "0 1px 3px rgba(26,107,26,0.5)",
  short: "0 1px 3px rgba(0,120,120,0.5)",
  long: "0 1px 3px rgba(184,105,0,0.5)",
};

interface Durations {
  work: number;
  short: number;
  long: number;
}

interface State {
  mode: Mode;
  timeLeft: number;
  running: boolean;
  completedWork: number; // 0–3, resets after long break
  sessionsCompleted: number; // increments only on natural work-timer completion
  naturalTransitions: number; // increments on any natural mode change (for notifications)
}

type Action =
  | { type: "TICK"; durations: Durations; autoStart: boolean }
  | { type: "TOGGLE" }
  | { type: "RESET"; durations: Durations }
  | { type: "SKIP"; durations: Durations; autoStart: boolean }
  | { type: "APPLY_DURATIONS"; durations: Durations };

function advance(
  state: State,
  natural: boolean,
  durations: Durations,
  autoStart: boolean
): State {
  const naturalTransitions = natural
    ? state.naturalTransitions + 1
    : state.naturalTransitions;

  if (state.mode === "work") {
    const next = state.completedWork + 1;
    const sessionsCompleted = natural
      ? state.sessionsCompleted + 1
      : state.sessionsCompleted;
    if (next >= 4) {
      return {
        mode: "long",
        timeLeft: durations.long,
        running: autoStart,
        completedWork: next,
        sessionsCompleted,
        naturalTransitions,
      };
    }
    return {
      mode: "short",
      timeLeft: durations.short,
      running: autoStart,
      completedWork: next,
      sessionsCompleted,
      naturalTransitions,
    };
  }
  const completedWork = state.completedWork >= 4 ? 0 : state.completedWork;
  return {
    mode: "work",
    timeLeft: durations.work,
    running: autoStart,
    completedWork,
    sessionsCompleted: state.sessionsCompleted,
    naturalTransitions,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "TICK":
      if (!state.running) return state;
      if (state.timeLeft <= 1)
        return advance(state, true, action.durations, action.autoStart);
      return { ...state, timeLeft: state.timeLeft - 1 };
    case "TOGGLE":
      return { ...state, running: !state.running };
    case "RESET":
      return {
        ...state,
        timeLeft: action.durations[state.mode],
        running: false,
      };
    case "SKIP":
      return advance(state, false, action.durations, action.autoStart);
    case "APPLY_DURATIONS":
      // Only apply new duration if timer is not running (safe to update)
      if (state.running) return state;
      return { ...state, timeLeft: action.durations[state.mode] };
  }
}

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function ProgressBar({
  value,
  total,
  color,
}: {
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.max(0, Math.min(1, value / total)) : 0;
  const filled = Math.round(pct * 28);
  const empty = 28 - filled;
  return (
    <span style={{ color }}>
      {"["}
      {"█".repeat(filled)}
      {"░".repeat(empty)}
      {"]"}
      {" "}
      <span className="text-xs opacity-60">
        {Math.round(pct * 100)}%
      </span>
    </span>
  );
}

export default function PomodoroTimer() {
  const { settings, save: saveSettings, loaded: settingsLoaded } = useSettings();
  const { theme, toggleTheme } = useTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [showNotify, setShowNotify] = useState(false);

  const { permission, requestPermission, notify } = useNotify();
  const { sound, setSound, volume, setVolume, cycleSound } = useAmbientSound();

  const MODE_COLOR = theme === "light" ? MODE_COLOR_LIGHT : MODE_COLOR_DARK;
  const MODE_GLOW  = theme === "light" ? MODE_GLOW_LIGHT  : MODE_GLOW_DARK;

  const durations: Durations = {
    work: settings.workDuration * 60,
    short: settings.shortBreak * 60,
    long: settings.longBreak * 60,
  };

  const [state, dispatch] = useReducer(reducer, {
    mode: "work",
    timeLeft: 25 * 60, // default; updated once settings load
    running: false,
    completedWork: 0,
    sessionsCompleted: 0,
    naturalTransitions: 0,
  });

  const { user, signOut } = useAuth();
  const { recordSession } = useSessionStats();
  const prevCompleted = useRef(0);

  // Once settings load from localStorage, apply the real durations
  useEffect(() => {
    if (settingsLoaded) {
      dispatch({ type: "APPLY_DURATIONS", durations });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsLoaded]);

  // Record a session whenever sessionsCompleted increments
  useEffect(() => {
    if (state.sessionsCompleted > prevCompleted.current) {
      recordSession();
      prevCompleted.current = state.sessionsCompleted;
    }
  }, [state.sessionsCompleted, recordSession]);

  // Fire browser notification on any natural timer transition
  const prevTransitions = useRef(0);
  useEffect(() => {
    if (state.naturalTransitions > prevTransitions.current) {
      prevTransitions.current = state.naturalTransitions;
      if (state.mode === "work") {
        notify("PomodoroSH", "Break complete — time to focus!");
      } else {
        const label = state.mode === "long" ? "long break" : "short break";
        notify("PomodoroSH", `Session done — enjoy your ${label}!`);
      }
    }
  }, [state.naturalTransitions, state.mode, notify]);

  // Tick — pass current durations + autoStart so advance() can use them
  useEffect(() => {
    if (!state.running) return;
    const id = setInterval(
      () => dispatch({ type: "TICK", durations, autoStart: settings.autoStart }),
      1000
    );
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.running, durations.work, durations.short, durations.long, settings.autoStart]);

  // Keyboard shortcuts
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;
      if (e.key === " ") {
        e.preventDefault();
        dispatch({ type: "TOGGLE" });
      }
      if (e.key === "r" || e.key === "R") dispatch({ type: "RESET", durations });
      if (e.key === "n" || e.key === "N")
        dispatch({ type: "SKIP", durations, autoStart: settings.autoStart });
      if (e.key === "c" || e.key === "C") setShowSettings((v) => !v);
      if (e.key === "a" || e.key === "A") cycleSound();
      if (e.key === "b" || e.key === "B") setShowNotify((v) => !v);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [durations.work, durations.short, durations.long, settings.autoStart, cycleSound]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const handleSettingsSave = useCallback(
    (next: Parameters<typeof saveSettings>[0]) => {
      saveSettings(next);
      dispatch({
        type: "APPLY_DURATIONS",
        durations: {
          work: next.workDuration * 60,
          short: next.shortBreak * 60,
          long: next.longBreak * 60,
        },
      });
    },
    [saveSettings]
  );

  const handleSettingsClose = useCallback(() => setShowSettings(false), []);

  const { mode, timeLeft, running, completedWork } = state;
  const color = MODE_COLOR[mode];
  const glow  = MODE_GLOW[mode];
  const total = durations[mode];
  const dots  = Array.from({ length: 4 }, (_, i) => i < completedWork % 4);

  return (
    <div className="space-y-6">
      {/* Command prompt */}
      <p className="text-xs" style={{ color: "var(--terminal-dim)" }}>$ pomoctl start</p>

      {/* Timer box */}
      <div
        className="border rounded p-6 md:p-8 space-y-6"
        style={{ borderColor: color + "44", backgroundColor: "var(--terminal-surface)" }}
      >
        {/* Header row */}
        <div className="flex items-center justify-between text-xs">
          <span style={{ color, textShadow: glow }}>
            MODE:{" "}
            <span className="font-bold tracking-widest">{MODE_LABEL[mode]}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="mr-1" style={{ color: "var(--terminal-dim)" }}>session</span>
            {dots.map((done, i) => (
              <span
                key={i}
                style={{
                  color: done ? "var(--terminal-amber)" : "var(--terminal-dim)",
                  textShadow: done ? "var(--glow-amber-sm)" : "none",
                }}
              >
                {done ? "●" : "○"}
              </span>
            ))}
          </span>
        </div>

        {/* Time display */}
        <div className="text-center py-4">
          <span
            className="font-mono font-bold"
            style={{
              fontSize: "clamp(3rem, 10vw, 6rem)",
              letterSpacing: "0.1em",
              color,
              textShadow: glow,
            }}
          >
            {fmt(timeLeft)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="text-sm font-mono">
          <ProgressBar value={total - timeLeft} total={total} color={color} />
        </div>

        {/* Controls */}
        <div
          className="border-t pt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs"
          style={{ borderColor: "var(--terminal-border)" }}
        >
          <button
            onClick={() => dispatch({ type: "TOGGLE" })}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            style={{ color: "var(--terminal-cyan)", textShadow: "var(--glow-cyan-sm)" }}
          >
            <kbd className="term-kbd">space</kbd>
            {running ? "pause" : "start"}
          </button>
          <button
            onClick={() => dispatch({ type: "RESET", durations })}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            style={{ color: "var(--terminal-dim)" }}
          >
            <kbd className="term-kbd">r</kbd>
            reset
          </button>
          <button
            onClick={() => dispatch({ type: "SKIP", durations, autoStart: settings.autoStart })}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            style={{ color: "var(--terminal-dim)" }}
          >
            <kbd className="term-kbd">n</kbd>
            skip
          </button>
          <button
            onClick={() => setShowNotify((v) => !v)}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity ml-auto"
            style={{
              color: showNotify ? "var(--terminal-amber)" : "var(--terminal-dim)",
              textShadow: showNotify ? "var(--glow-amber-sm)" : "none",
            }}
          >
            <kbd className="term-kbd">b</kbd>
            notify
          </button>
          <button
            onClick={() => setShowSettings((v) => !v)}
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            style={{
              color: showSettings ? "var(--terminal-cyan)" : "var(--terminal-dim)",
              textShadow: showSettings ? "var(--glow-cyan-sm)" : "none",
            }}
          >
            <kbd className="term-kbd">c</kbd>
            config
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <SettingsPanel
          settings={settings}
          onSave={handleSettingsSave}
          onClose={handleSettingsClose}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {/* Notify panel */}
      {showNotify && (
        <NotifyPanel
          permission={permission}
          onRequestPermission={requestPermission}
          sound={sound}
          onSoundChange={setSound}
          volume={volume}
          onVolumeChange={setVolume}
          onClose={() => setShowNotify(false)}
        />
      )}

      {/* Tasks */}
      <TaskList />

      {/* Status line */}
      <div className="flex items-center gap-2 text-sm">
        <span style={{ color: "var(--terminal-cyan)" }}>
          {user?.email ?? "user"}@pomodoro-terminal:~$
        </span>
        <span
          className="cursor-blink inline-block w-2.5 h-5"
          style={{ backgroundColor: "var(--terminal-green)" }}
        />
        <button
          onClick={signOut}
          className="ml-auto text-xs hover:opacity-80 transition-opacity"
          style={{ color: "var(--terminal-dim)" }}
        >
          <kbd className="term-kbd">q</kbd>
          logout
        </button>
      </div>
    </div>
  );
}
