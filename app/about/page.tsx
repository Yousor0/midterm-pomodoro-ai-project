"use client";

import { useEffect, useState } from "react";
import TerminalChrome from "../components/TerminalChrome";

const FEATURES = [
  { cmd: "timer",    desc: "25-min work sessions, 5-min short breaks, 15-min long breaks" },
  { cmd: "sessions", desc: "Track completed pomodoros with daily/weekly stats & streaks" },
  { cmd: "tasks",    desc: "Add tasks, assign pomodoro estimates, mark them complete" },
  { cmd: "settings", desc: "Configure durations, auto-start, and persist across sessions" },
  { cmd: "notify",   desc: "Browser notifications + ambient sounds (rain, white noise, lo-fi)" },
];

function useTypingEffect(text: string, speed = 30, startDelay = 0) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

export default function AboutPage() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timings = [400, 1200, 2200, 3800, 5400];
    const timers = timings.map((t, i) =>
      setTimeout(() => setPhase(i + 1), t)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const tagline = useTypingEffect(
    "A terminal-flavored Pomodoro timer for focused minds.",
    22,
    1800
  );

  return (
    <TerminalChrome>
      <div className="space-y-6">

        {/* Boot */}
        {phase >= 1 && (
          <p className="text-xs tracking-widest" style={{ color: "var(--terminal-dim)" }}>
            Booting PomodoroSH v0.1.0...{" "}
            <span style={{ color: "var(--terminal-green)" }}>[ OK ]</span>
          </p>
        )}

        {/* ASCII banner */}
        {phase >= 2 && (
          <div>
            <p className="text-xs mb-2" style={{ color: "var(--terminal-dim)" }}>$ cat /etc/motd</p>
            <pre
              className="text-[7px] sm:text-[9px] md:text-xs leading-tight overflow-x-auto terminal-glow"
              style={{ color: "var(--terminal-green)" }}
            >
{`██████╗  ██████╗ ███╗   ███╗ ██████╗ ██████╗  ██████╗ ██████╗  ██████╗ ███████╗██╗  ██╗
██╔══██╗██╔═══██╗████╗ ████║██╔═══██╗██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗██╔════╝██║  ██║
██████╔╝██║   ██║██╔████╔██║██║   ██║██║  ██║██║   ██║██████╔╝██║   ██║███████╗███████║
██╔═══╝ ██║   ██║██║╚██╔╝██║██║   ██║██║  ██║██║   ██║██╔══██╗██║   ██║╚════██║██╔══██║
██║     ╚██████╔╝██║ ╚═╝ ██║╚██████╔╝██████╔╝╚██████╔╝██║  ██║╚██████╔╝███████║██║  ██║
╚═╝      ╚═════╝ ╚═╝     ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝`}
            </pre>
          </div>
        )}

        {/* Tagline */}
        {phase >= 3 && (
          <div>
            <p className="text-xs mb-1" style={{ color: "var(--terminal-dim)" }}>$ echo $DESCRIPTION</p>
            <p
              className="text-sm md:text-base terminal-glow"
              style={{ color: "var(--terminal-green)" }}
            >
              {tagline.displayed}
              {!tagline.done && (
                <span
                  className="cursor-blink ml-0.5 inline-block w-2 h-4 align-middle"
                  style={{ backgroundColor: "var(--terminal-green)" }}
                />
              )}
            </p>

            {tagline.done && (
              <div
                className="mt-4 border rounded p-4 text-sm opacity-90 space-y-1"
                style={{
                  borderColor: "var(--terminal-border)",
                  backgroundColor: "var(--terminal-surface)",
                  color: "var(--terminal-green)",
                }}
              >
                <p className="text-xs mb-2" style={{ color: "var(--terminal-dim)" }}># README.md</p>
                <p>
                  PomodoroSH is a Pomodoro timer built for students who want to stay in flow.
                  Balance your work sessions and breaks, track your progress over time, and
                  manage your task list — all from a slick terminal-inspired interface.
                </p>
                <p className="mt-2 text-xs" style={{ color: "var(--terminal-dim)" }}>
                  Browser notifications keep you on track even when you switch tabs.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Features list */}
        {phase >= 4 && (
          <div>
            <p className="text-xs mb-3" style={{ color: "var(--terminal-dim)" }}>$ pomoctl --list-features</p>
            <div className="space-y-2">
              {FEATURES.map((f, i) => (
                <div key={f.cmd} className="flex gap-3 text-sm">
                  <span
                    className="shrink-0 terminal-glow-cyan"
                    style={{ color: "var(--terminal-cyan)" }}
                  >
                    [{String(i + 1).padStart(2, "0")}]
                  </span>
                  <span
                    className="shrink-0 w-20 terminal-glow-amber"
                    style={{ color: "var(--terminal-amber)" }}
                  >
                    {f.cmd}
                  </span>
                  <span className="opacity-80" style={{ color: "var(--terminal-green)" }}>
                    — {f.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ready prompt */}
        {phase >= 5 && (
          <div
            className="pt-4 border-t"
            style={{ borderColor: "var(--terminal-border)" }}
          >
            <p className="text-xs mb-2" style={{ color: "var(--terminal-dim)" }}>$ pomoctl --status</p>
            <p
              className="text-sm terminal-glow-amber"
              style={{ color: "var(--terminal-amber)" }}
            >
              [ READY ] PomodoroSH is running.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {["Next.js", "React", "TypeScript", "TailwindCSS"].map((tech) => (
                <span
                  key={tech}
                  className="border px-2 py-0.5 rounded terminal-glow-cyan"
                  style={{
                    borderColor: "var(--terminal-border)",
                    color: "var(--terminal-cyan)",
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm">
              <span style={{ color: "var(--terminal-cyan)" }}>user@pomodoro-terminal:~$</span>
              <span
                className="cursor-blink inline-block w-2.5 h-5"
                style={{ backgroundColor: "var(--terminal-green)" }}
              />
            </div>
          </div>
        )}

      </div>
    </TerminalChrome>
  );
}
