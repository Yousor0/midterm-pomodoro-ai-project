"use client";

import AuthGate from "./components/AuthGate";
import TerminalChrome from "./components/TerminalChrome";
import PomodoroTimer from "./components/PomodoroTimer";

export default function Home() {
  return (
    <AuthGate>
      <TerminalChrome>
        <PomodoroTimer />
      </TerminalChrome>
    </AuthGate>
  );
}
