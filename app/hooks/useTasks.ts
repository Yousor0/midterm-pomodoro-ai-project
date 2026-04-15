"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "../lib/client";

export interface Task {
  id: string;
  title: string;
  estimate: number; // pomodoros
  completed: boolean;
  createdAt: number;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data.user?.id;
      if (!uid) { setLoaded(true); return; }

      const { data: rows } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", uid)
        .order("created_at", { ascending: true });

      if (rows) {
        setTasks(
          rows.map((r) => ({
            id: r.id,
            title: r.title,
            estimate: r.estimate,
            completed: r.completed,
            createdAt: new Date(r.created_at).getTime(),
          }))
        );
      }
      setLoaded(true);
    });
  }, []);

  const addTask = useCallback(async (title: string, estimate: number) => {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    if (!uid) return;

    const optimistic: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      estimate: Math.max(1, estimate),
      completed: false,
      createdAt: Date.now(),
    };

    // Optimistic update
    setTasks((prev) => [...prev, optimistic]);

    const { data } = await supabase
      .from("tasks")
      .insert({
        user_id: uid,
        title: optimistic.title,
        estimate: optimistic.estimate,
        completed: false,
      })
      .select()
      .single();

    // Replace optimistic row with the real DB row (gets the real uuid)
    if (data) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === optimistic.id
            ? { ...t, id: data.id, createdAt: new Date(data.created_at).getTime() }
            : t
        )
      );
    }
  }, []);

  const toggleTask = useCallback(async (id: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === id);
      if (!task) return prev;
      const next = prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed } : t
      );

      // Fire-and-forget update
      createClient()
        .from("tasks")
        .update({ completed: !task.completed })
        .eq("id", id)
        .then(() => {});

      return next;
    });
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await createClient().from("tasks").delete().eq("id", id);
  }, []);

  const clearCompleted = useCallback(async () => {
    setTasks((prev) => {
      const completedIds = prev.filter((t) => t.completed).map((t) => t.id);
      if (completedIds.length === 0) return prev;

      createClient()
        .from("tasks")
        .delete()
        .in("id", completedIds)
        .then(() => {});

      return prev.filter((t) => !t.completed);
    });
  }, []);

  return { tasks, loaded, addTask, toggleTask, deleteTask, clearCompleted };
}
