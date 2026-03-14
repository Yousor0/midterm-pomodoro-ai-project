"use client";

import { useEffect, useCallback } from "react";
import { SoundType, SOUND_CYCLE, SOUND_LABELS } from "../hooks/useAmbientSound";
import { NotifyPermission } from "../hooks/useNotify";

interface Props {
  permission: NotifyPermission;
  onRequestPermission: () => void;
  sound: SoundType;
  onSoundChange: (s: SoundType) => void;
  volume: number;
  onVolumeChange: (v: number) => void;
  onClose: () => void;
}

const PERMISSION_LABEL: Record<string, string> = {
  granted: "ENABLED",
  denied: "DENIED — allow in browser settings",
  default: "NOT SET",
  unsupported: "UNSUPPORTED",
};

const PERMISSION_COLOR: Record<string, string> = {
  granted: "var(--terminal-green)",
  denied: "var(--terminal-red)",
  default: "var(--terminal-amber)",
  unsupported: "var(--terminal-muted)",
};

export default function NotifyPanel({
  permission,
  onRequestPermission,
  sound,
  onSoundChange,
  volume,
  onVolumeChange,
  onClose,
}: Props) {
  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <div
      className="term-panel space-y-4"
      style={{
        borderColor: "var(--notify-border)",
        backgroundColor: "var(--notify-surface)",
      }}
    >
      {/* Header */}
      <p className="text-xs font-mono" style={{ color: "var(--terminal-amber)" }}>
        $ notify --configure
      </p>

      <div className="space-y-5 pl-2">
        {/* Browser notifications */}
        <div className="space-y-2">
          <p className="term-section-label tracking-wider">-- browser_notifications</p>
          <div className="flex items-center gap-3 text-xs font-mono pl-2">
            <span className="w-20 shrink-0" style={{ color: "var(--terminal-muted)" }}>
              status
            </span>
            <span
              style={{
                color: PERMISSION_COLOR[permission] ?? "var(--terminal-muted)",
                textShadow:
                  permission === "granted" ? "var(--glow-green-sm)" : "none",
              }}
            >
              {PERMISSION_LABEL[permission] ?? permission.toUpperCase()}
            </span>
          </div>
          {permission !== "granted" &&
            permission !== "unsupported" &&
            permission !== "denied" && (
              <div className="pl-2">
                <button
                  onClick={onRequestPermission}
                  className="text-xs font-mono hover:opacity-80 transition-opacity"
                  style={{
                    color: "var(--terminal-amber)",
                    textShadow: "var(--glow-amber-sm)",
                  }}
                >
                  &gt; enable notifications
                </button>
              </div>
            )}
        </div>

        {/* Ambient sound */}
        <div className="space-y-3">
          <p className="term-section-label tracking-wider">-- ambient_sound</p>
          <div className="flex flex-wrap items-center gap-2 pl-2">
            {SOUND_CYCLE.map((s) => (
              <button
                key={s}
                onClick={() => onSoundChange(s)}
                className="text-xs font-mono px-2 py-0.5 border rounded hover:opacity-80 transition-opacity"
                style={{
                  borderColor:
                    sound === s ? "var(--terminal-amber)" : "var(--notify-inactive)",
                  color:
                    sound === s ? "var(--terminal-amber)" : "var(--terminal-muted)",
                  textShadow: sound === s ? "var(--glow-amber-sm)" : "none",
                  backgroundColor:
                    sound === s ? "rgba(255,176,0,0.07)" : "transparent",
                }}
              >
                {SOUND_LABELS[s]}
              </button>
            ))}
          </div>
          {sound !== "off" && (
            <div className="flex items-center gap-3 pl-2 text-xs font-mono">
              <span className="w-20 shrink-0" style={{ color: "var(--terminal-muted)" }}>
                volume
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-28 cursor-pointer accent-(--terminal-amber)"
              />
              <span className="tabular-nums" style={{ color: "var(--terminal-amber)" }}>
                {Math.round(volume * 100)}%
              </span>
            </div>
          )}
          {sound !== "off" && (
            <p className="pl-2 text-xs font-mono" style={{ color: "var(--terminal-comment)" }}>
              # procedural audio via web audio api
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div
        className="border-t pt-3 flex gap-6 text-xs font-mono"
        style={{ borderColor: "var(--notify-divider)" }}
      >
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          style={{ color: "var(--terminal-dim)" }}
        >
          <kbd className="term-kbd">esc</kbd>
          close
        </button>
      </div>
    </div>
  );
}
