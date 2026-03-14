"use client";

import { useRef, useState } from "react";
import { useTasks } from "../hooks/useTasks";

const MAX_EST = 8;

function PomoCount({ estimate, color }: { estimate: number; color: string }) {
  return (
    <span className="font-mono text-xs tabular-nums" style={{ color, opacity: 0.8 }}>
      {estimate}p
    </span>
  );
}

export default function TaskList() {
  const { tasks, loaded, addTask, toggleTask, deleteTask, clearCompleted } =
    useTasks();
  const [title, setTitle] = useState("");
  const [estimate, setEstimate] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addTask(title, estimate);
    setTitle("");
    setEstimate(1);
    inputRef.current?.focus();
  }

  const pending = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);
  const totalPomos = pending.reduce((s, t) => s + t.estimate, 0);

  return (
    <div className="space-y-3">
      <p className="text-xs" style={{ color: "var(--terminal-dim)" }}>$ tasks --list</p>

      <div
        className="border rounded p-4 md:p-6 space-y-4"
        style={{
          borderColor: "var(--terminal-border)",
          backgroundColor: "var(--terminal-surface)",
        }}
      >
        {/* Add task form */}
        <form onSubmit={handleAdd} className="flex items-center gap-2">
          <span className="text-xs shrink-0" style={{ color: "var(--terminal-cyan)" }}>{">"}</span>
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="new task…"
            className="flex-1 bg-transparent text-xs font-mono outline-none pb-0.5 border-b transition-colors"
            style={{
              borderColor: "var(--terminal-border)",
              color: "var(--terminal-green)",
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = "var(--terminal-green)")
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor = "var(--terminal-border)")
            }
          />
          {/* Estimate stepper */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setEstimate((v) => Math.max(1, v - 1))}
              className="text-xs w-4 leading-none hover:opacity-80 transition-opacity"
              style={{ color: "var(--terminal-dim)" }}
              tabIndex={-1}
            >
              −
            </button>
            <span className="text-xs font-mono w-4 text-center" style={{ color: "var(--terminal-amber)" }}>
              {estimate}
            </span>
            <button
              type="button"
              onClick={() => setEstimate((v) => Math.min(MAX_EST, v + 1))}
              className="text-xs w-4 leading-none hover:opacity-80 transition-opacity"
              style={{ color: "var(--terminal-dim)" }}
              tabIndex={-1}
            >
              +
            </button>
            <span className="text-[10px] ml-0.5 font-mono" style={{ color: "var(--terminal-dim)" }}>p</span>
          </div>
          <button
            type="submit"
            className="text-[10px] font-mono border px-2 py-0.5 rounded transition-colors shrink-0 hover:opacity-80"
            style={{
              borderColor: "var(--terminal-dim)",
              color: "var(--terminal-dim)",
            }}
          >
            add
          </button>
        </form>

        {/* Task list */}
        {!loaded ? (
          <span className="text-xs opacity-60" style={{ color: "var(--terminal-dim)" }}>loading…</span>
        ) : tasks.length === 0 ? (
          <p className="text-xs opacity-40 font-mono" style={{ color: "var(--terminal-dim)" }}>
            no tasks — add one above
          </p>
        ) : (
          <ul className="space-y-1.5">
            {pending.map((task) => (
              <li key={task.id} className="flex items-center gap-2 group">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="shrink-0 font-mono text-xs hover:opacity-80 transition-opacity"
                  style={{ color: "var(--terminal-dim)" }}
                  title="mark complete"
                >
                  [ ]
                </button>
                <span className="flex-1 text-xs font-mono truncate" style={{ color: "var(--terminal-green)" }}>
                  {task.title}
                </span>
                <PomoCount estimate={task.estimate} color="var(--terminal-amber)" />
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-xs font-mono opacity-0 group-hover:opacity-100 transition-all"
                  style={{ color: "var(--terminal-dim)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.color = "var(--terminal-red)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = "var(--terminal-dim)")
                  }
                  title="delete"
                >
                  ✕
                </button>
              </li>
            ))}

            {done.length > 0 && (
              <>
                <li
                  className="border-t pt-1.5"
                  style={{ borderColor: "var(--terminal-border)" }}
                >
                  <span className="text-[10px] opacity-50 font-mono" style={{ color: "var(--terminal-dim)" }}>
                    completed
                  </span>
                </li>
                {done.map((task) => (
                  <li key={task.id} className="flex items-center gap-2 group">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="shrink-0 font-mono text-xs hover:opacity-80 transition-opacity"
                      style={{ color: "var(--terminal-dim)" }}
                      title="unmark"
                    >
                      [x]
                    </button>
                    <span
                      className="flex-1 text-xs font-mono line-through truncate opacity-50"
                      style={{ color: "var(--terminal-dim)" }}
                    >
                      {task.title}
                    </span>
                    <PomoCount estimate={task.estimate} color="var(--terminal-dim)" />
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-xs font-mono opacity-0 group-hover:opacity-100 transition-all"
                      style={{ color: "var(--terminal-dim)" }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "var(--terminal-red)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "var(--terminal-dim)")
                      }
                      title="delete"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </>
            )}
          </ul>
        )}

        {/* Footer summary */}
        {tasks.length > 0 && (
          <div
            className="border-t pt-3 flex items-center justify-between"
            style={{ borderColor: "var(--terminal-border)" }}
          >
            <span className="text-[10px] font-mono" style={{ color: "var(--terminal-dim)" }}>
              {pending.length} pending · {totalPomos}p remaining
            </span>
            {done.length > 0 && (
              <button
                onClick={clearCompleted}
                className="text-[10px] font-mono hover:opacity-80 transition-opacity"
                style={{ color: "var(--terminal-dim)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--terminal-red)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--terminal-dim)")
                }
              >
                clear done
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
