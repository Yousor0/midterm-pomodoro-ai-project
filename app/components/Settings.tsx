"use client";

import { useState, useEffect, useCallback } from "react";
import { Settings, DEFAULT_SETTINGS } from "../hooks/useSettings";
import { Theme } from "../hooks/useTheme";

interface Props {
  settings: Settings;
  onSave: (s: Settings) => void;
  onClose: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}

function NumInput({
  label,
  value,
  min,
  max,
  onChange,
  color,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      <span className="w-32 shrink-0" style={{ color: "var(--terminal-dim)" }}>
        {label}
      </span>
      <span style={{ color }} className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="border border-current w-5 h-5 flex items-center justify-center hover:opacity-70 transition-opacity text-[10px]"
        >
          −
        </button>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v)) onChange(Math.max(min, Math.min(max, v)));
          }}
          className="w-10 text-center bg-transparent border-b border-current outline-none tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          style={{ color }}
        />
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="border border-current w-5 h-5 flex items-center justify-center hover:opacity-70 transition-opacity text-[10px]"
        >
          +
        </button>
        <span className="ml-1" style={{ color: "var(--terminal-dim)" }}>
          min
        </span>
      </span>
    </div>
  );
}

function Toggle({
  label,
  value,
  onToggle,
  color,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-mono">
      <span className="w-32 shrink-0" style={{ color: "var(--terminal-dim)" }}>
        {label}
      </span>
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
        style={{
          color: value ? color : "var(--terminal-dim)",
          textShadow: value ? "var(--glow-green-sm)" : "none",
        }}
      >
        <span
          className="border border-current w-4 h-4 flex items-center justify-center text-[10px]"
        >
          {value ? "✓" : " "}
        </span>
        {value ? "on" : "off"}
      </button>
    </div>
  );
}

export default function SettingsPanel({
  settings,
  onSave,
  onClose,
  theme,
  onToggleTheme,
}: Props) {
  const [draft, setDraft] = useState<Settings>(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleSave = useCallback(() => {
    const clamped: Settings = {
      workDuration: Math.max(1, Math.min(90, draft.workDuration)),
      shortBreak: Math.max(1, Math.min(30, draft.shortBreak)),
      longBreak: Math.max(1, Math.min(60, draft.longBreak)),
      autoStart: draft.autoStart,
    };
    onSave(clamped);
    onClose();
  }, [draft, onSave, onClose]);

  function handleReset() {
    setDraft(DEFAULT_SETTINGS);
  }

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.key === "s" || e.key === "S") && !e.ctrlKey && !e.metaKey) {
        if (
          !(e.target instanceof HTMLInputElement) &&
          !(e.target instanceof HTMLTextAreaElement)
        ) {
          e.preventDefault();
          handleSave();
        }
      }
    },
    [handleSave, onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <div
      className="term-panel space-y-4"
      style={{
        borderColor: "var(--settings-border)",
        backgroundColor: "var(--settings-surface)",
      }}
    >
      {/* Header */}
      <p className="text-xs font-mono" style={{ color: "var(--terminal-cyan)" }}>
        $ config --edit
      </p>

      {/* Settings rows */}
      <div className="space-y-3 pl-2">
        <NumInput
          label="work_duration"
          value={draft.workDuration}
          min={1}
          max={90}
          onChange={(v) => set("workDuration", v)}
          color="var(--terminal-green)"
        />
        <NumInput
          label="short_break"
          value={draft.shortBreak}
          min={1}
          max={30}
          onChange={(v) => set("shortBreak", v)}
          color="var(--terminal-cyan)"
        />
        <NumInput
          label="long_break"
          value={draft.longBreak}
          min={1}
          max={60}
          onChange={(v) => set("longBreak", v)}
          color="var(--terminal-amber)"
        />
        <Toggle
          label="auto_start"
          value={draft.autoStart}
          onToggle={() => set("autoStart", !draft.autoStart)}
          color="var(--terminal-green)"
        />

        {/* Theme toggle */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-32 shrink-0" style={{ color: "var(--terminal-dim)" }}>
            theme_mode
          </span>
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
            style={{ color: "var(--terminal-cyan)" }}
          >
            <span
              className="border border-current w-4 h-4 flex items-center justify-center text-[10px]"
            >
              {theme === "light" ? "☀" : "◑"}
            </span>
            {theme === "light" ? "light" : "dark"}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div
        className="border-t pt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs"
        style={{ borderColor: "var(--settings-divider)" }}
      >
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          style={{
            color: "var(--terminal-green)",
            textShadow: "var(--glow-green-sm)",
          }}
        >
          <kbd className="term-kbd">s</kbd>
          save
        </button>
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          style={{ color: "var(--terminal-dim)" }}
        >
          <kbd className="term-kbd">esc</kbd>
          cancel
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity ml-auto"
          style={{ color: "var(--terminal-muted)" }}
        >
          reset defaults
        </button>
      </div>
    </div>
  );
}
