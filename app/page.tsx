"use client";

import { useEffect, useState } from "react";

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

export default function Home() {
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
    <main className="min-h-screen bg-[#0d1117] text-[#33ff33] font-mono p-4 md:p-8 flex flex-col">

      {/* Window chrome */}
      <div className="w-full max-w-5xl mx-auto border border-[#1f2f1f] rounded-lg overflow-hidden shadow-[0_0_40px_rgba(51,255,51,0.08)] flex-1 flex flex-col">

        {/* Title bar */}
        <div className="bg-[#0f1a0f] border-b border-[#1f2f1f] px-4 py-2 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff3333] opacity-80" />
          <span className="w-3 h-3 rounded-full bg-[#ffb000] opacity-80" />
          <span className="w-3 h-3 rounded-full bg-[#33ff33] opacity-80" />
          <span className="ml-4 text-[#1a8c1a] text-xs tracking-widest select-none">
            user@pomodoro-terminal: ~/
          </span>
        </div>

        {/* Terminal body */}
        <div className="flex-1 bg-[#0d1117] p-6 md:p-10 space-y-6 overflow-auto">

          {/* Boot */}
          {phase >= 1 && (
            <p className="text-[#1a8c1a] text-xs tracking-widest">
              Booting PomodoroSH v0.1.0...{" "}
              <span className="text-[#33ff33]">[ OK ]</span>
            </p>
          )}

          {/* ASCII banner */}
          {phase >= 2 && (
            <div>
              <p className="text-[#1a8c1a] text-xs mb-2">$ cat /etc/motd</p>
              <pre
                className="text-[#33ff33] text-[7px] sm:text-[9px] md:text-xs leading-tight overflow-x-auto"
                style={{ textShadow: "0 0 8px rgba(51,255,51,0.5)" }}
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
              <p className="text-[#1a8c1a] text-xs mb-1">$ echo $DESCRIPTION</p>
              <p
                className="text-[#33ff33] text-sm md:text-base"
                style={{ textShadow: "0 0 6px rgba(51,255,51,0.4)" }}
              >
                {tagline.displayed}
                {!tagline.done && (
                  <span className="cursor-blink ml-0.5 inline-block w-2 h-4 bg-[#33ff33] align-middle" />
                )}
              </p>

              {/* Project description block */}
              {tagline.done && (
                <div className="mt-4 border border-[#1f2f1f] rounded p-4 bg-[#0f1a0f] text-sm text-[#33ff33] opacity-90 space-y-1">
                  <p className="text-[#1a8c1a] text-xs mb-2"># README.md</p>
                  <p>
                    PomodoroSH is a Pomodoro timer built for students who want to stay in flow.
                    Balance your work sessions and breaks, track your progress over time, and
                    manage your task list — all from a slick terminal-inspired interface.
                  </p>
                  <p className="mt-2 text-[#1a8c1a] text-xs">
                    Browser notifications keep you on track even when you switch tabs.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Features list */}
          {phase >= 4 && (
            <div>
              <p className="text-[#1a8c1a] text-xs mb-3">$ pomoctl --list-features</p>
              <div className="space-y-2">
                {FEATURES.map((f, i) => (
                  <div key={f.cmd} className="flex gap-3 text-sm">
                    <span
                      className="text-[#00ffff] shrink-0"
                      style={{ textShadow: "0 0 6px rgba(0,255,255,0.4)" }}
                    >
                      [{String(i + 1).padStart(2, "0")}]
                    </span>
                    <span
                      className="text-[#ffb000] shrink-0 w-20"
                      style={{ textShadow: "0 0 6px rgba(255,176,0,0.4)" }}
                    >
                      {f.cmd}
                    </span>
                    <span className="text-[#33ff33] opacity-80">— {f.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ready prompt */}
          {phase >= 5 && (
            <div className="pt-4 border-t border-[#1f2f1f]">
              <p className="text-[#1a8c1a] text-xs mb-2">$ pomoctl --status</p>
              <p
                className="text-[#ffb000] text-sm"
                style={{ textShadow: "0 0 6px rgba(255,176,0,0.4)" }}
              >
                [ READY ] System initializing... app coming soon.
              </p>

              {/* Tech stack badges */}
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {["Next.js", "React", "TypeScript", "TailwindCSS", "Zustand", "Recharts"].map((tech) => (
                  <span
                    key={tech}
                    className="border border-[#1f2f1f] px-2 py-0.5 rounded text-[#00ffff]"
                    style={{ textShadow: "0 0 4px rgba(0,255,255,0.3)" }}
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm">
                <span className="text-[#00ffff]">user@pomodoro-terminal:~$</span>
                <span className="cursor-blink inline-block w-2.5 h-5 bg-[#33ff33]" />
              </div>
            </div>
          )}

        </div>

        {/* Status bar */}
        <div className="bg-[#0f1a0f] border-t border-[#1f2f1f] px-4 py-1 flex justify-between text-[10px] text-[#1a8c1a] select-none">
          <span>PomodoroSH v0.1.0</span>
          <span>Next.js · TailwindCSS · TypeScript</span>
          <span>INSERT</span>
        </div>
      </div>
    </main>
  );
}
