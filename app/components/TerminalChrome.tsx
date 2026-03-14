"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "timer" },
  { href: "/stats", label: "stats" },
  { href: "/about", label: "about" },
];

export default function TerminalChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main
      className="min-h-screen font-mono p-4 md:p-8 flex flex-col"
      style={{ background: "var(--background)", color: "var(--terminal-green)" }}
    >
      <div
        className="w-full max-w-6xl mx-auto border rounded-lg overflow-hidden flex-1 flex flex-col"
        style={{
          borderColor: "var(--terminal-border)",
          boxShadow: "var(--terminal-outer-glow)",
        }}
      >
        {/* Title bar */}
        <div
          className="border-b px-4 py-2 flex items-center gap-2"
          style={{
            background: "var(--terminal-surface)",
            borderColor: "var(--terminal-border)",
          }}
        >
          <span className="w-3 h-3 rounded-full opacity-80" style={{ background: "var(--terminal-red)" }} />
          <span className="w-3 h-3 rounded-full opacity-80" style={{ background: "var(--terminal-amber)" }} />
          <span className="w-3 h-3 rounded-full opacity-80" style={{ background: "var(--terminal-green)" }} />
          <span
            className="ml-4 text-xs tracking-widest select-none"
            style={{ color: "var(--terminal-dim)" }}
          >
            user@pomodoro-terminal: ~{pathname}
          </span>

          {/* Nav tabs */}
          <div className="ml-auto flex items-center gap-1 text-xs">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-2 py-0.5 rounded transition-colors select-none"
                  style={{
                    color: active ? "var(--background)" : "var(--terminal-dim)",
                    backgroundColor: active ? "var(--terminal-green)" : "transparent",
                  }}
                >
                  ./{item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div
          className="flex-1 p-6 md:p-10 overflow-auto"
          style={{ background: "var(--background)" }}
        >
          {children}
        </div>

        {/* Status bar */}
        <div
          className="border-t px-4 py-1 flex justify-between text-[10px] select-none"
          style={{
            background: "var(--terminal-surface)",
            borderColor: "var(--terminal-border)",
            color: "var(--terminal-dim)",
          }}
        >
          <span>PomodoroSH v0.1.0</span>
          <span>Next.js · TailwindCSS · TypeScript</span>
          <span>INSERT</span>
        </div>
      </div>
    </main>
  );
}
