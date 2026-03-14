"use client";

import TerminalChrome from "./components/TerminalChrome";
import PomodoroTimer from "./components/PomodoroTimer";

export default function Home() {
  return (
    <TerminalChrome>
      <PomodoroTimer />
    </TerminalChrome>
  );
}
