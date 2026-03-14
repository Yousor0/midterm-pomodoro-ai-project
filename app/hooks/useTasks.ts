"use client";

import { useCallback, useEffect, useState } from "react";

export interface Task {
  id: string;
  title: string;
  estimate: number; // pomodoros
  completed: boolean;
  createdAt: number;
}

const STORAGE_KEY = "pomoctl:tasks";

function load(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

function save(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    // ignore quota errors
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTasks(load());
    setLoaded(true);
  }, []);

  const addTask = useCallback((title: string, estimate: number) => {
    setTasks((prev) => {
      const next = [
        ...prev,
        {
          id: crypto.randomUUID(),
          title: title.trim(),
          estimate: Math.max(1, estimate),
          completed: false,
          createdAt: Date.now(),
        },
      ];
      save(next);
      return next;
    });
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks((prev) => {
      const next = prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );
      save(next);
      return next;
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      save(next);
      return next;
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setTasks((prev) => {
      const next = prev.filter((t) => !t.completed);
      save(next);
      return next;
    });
  }, []);

  return { tasks, loaded, addTask, toggleTask, deleteTask, clearCompleted };
}
