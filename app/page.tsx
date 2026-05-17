"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [task, setTask] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [thoughts, setThoughts] = useState<{ id: number; text: string }[]>([]);
  const [thoughtInput, setThoughtInput] = useState("");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const captureInputRef = useRef<HTMLInputElement>(null);
  const stepsRef = useRef<HTMLOListElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  const [floatingHeight, setFloatingHeight] = useState(80);

  useEffect(() => {
    if (steps.length > 0) {
      stepsRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [steps]);

  useEffect(() => {
    if (floatingRef.current) {
      setFloatingHeight(floatingRef.current.getBoundingClientRect().height);
    }
  }, [thoughts.length]);

  async function breakdown(taskText: string) {
    setLoading(true);
    setError("");
    setSteps([]);

    try {
      const res = await fetch("/api/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: taskText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Une erreur est survenue.");
        return;
      }

      setSteps(data.steps);
    } catch {
      setError("Impossible de contacter le serveur. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  async function submitTask() {
    const trimmed = task.trim();
    if (trimmed.length < 3) {
      setError("Décris ta tâche en quelques mots.");
      return;
    }
    if (trimmed.length > 500) {
      setError("500 caractères maximum.");
      return;
    }
    await breakdown(task);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await submitTask();
  }

  function addThought() {
    const trimmed = thoughtInput.trim();
    if (trimmed.length < 2 || trimmed.length > 200) return;
    setThoughts((prev) => [...prev, { id: Date.now(), text: trimmed }]);
    setThoughtInput("");
    captureInputRef.current?.focus();
  }

  function transformThought(thought: { id: number; text: string }) {
    setTask(thought.text);
    setThoughts((prev) => prev.filter((t) => t.id !== thought.id));
    breakdown(thought.text);
  }

  return (
    <>
      <main className="min-h-screen pt-12 sm:pt-0 sm:flex sm:flex-col sm:items-center sm:justify-center bg-white dark:bg-zinc-950" style={{ paddingBottom: floatingHeight + 24 }}>
        <div className="w-full max-w-2xl mx-auto px-6 sm:px-8">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
            Quelle est ta tâche&nbsp;?
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mb-8">
            Une tâche floue. Des étapes claires.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <textarea
                ref={textareaRef}
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onInput={(e) => setTask((e.target as HTMLTextAreaElement).value)}
                placeholder="Ex : Finir mon rapport de stage..."
                rows={4}
                maxLength={500}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="sentences"
                spellCheck={false}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-base text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
              />
              <p className={`text-xs text-right tabular-nums ${task.length >= 500 ? "text-red-500" : "text-zinc-400"}`}>
                {task.length} / 500
              </p>
            </div>
            <button
              type="button"
              onClick={() => { if (task.trim().length >= 3 && !loading) submitTask(); }}
              className={`w-full rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors ${task.trim().length < 3 || loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {loading ? "En cours…" : "Découper en micro-étapes"}
            </button>
          </form>

          {error && (
            <p className="mt-6 text-sm text-red-500">{error}</p>
          )}

          {steps.length > 0 && (
            <ol ref={stepsRef} className="mt-8 flex flex-col gap-3">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="shrink-0 w-7 h-7 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-medium text-zinc-600 dark:text-zinc-300">
                    {i + 1}
                  </span>
                  <span className="text-zinc-800 dark:text-zinc-200 pt-0.5 leading-relaxed">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </main>

      <div ref={floatingRef} className="fixed bottom-0 left-0 right-0 z-50">
        {thoughts.length > 0 && (
          <div className="px-3 sm:px-4">
            <div className="max-w-2xl mx-auto backdrop-blur-sm bg-black/95 border border-white/10 rounded-t-xl shadow-[0_-4px_24px_rgba(0,0,0,0.4)] pt-2 pb-2 px-2">
              <ul className="flex flex-col gap-1">
                {thoughts.map((thought) => (
                  <li
                    key={thought.id}
                    className="flex items-center justify-between gap-3 border border-white/10 rounded-lg px-3 py-2"
                  >
                    <span className="text-sm text-zinc-300 flex-1 min-w-0 truncate">
                      {thought.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => transformThought(thought)}
                      className="shrink-0 min-h-13 flex items-center text-xs text-zinc-400 hover:text-indigo-400 transition-colors"
                    >
                      → Découper
                    </button>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-600 italic mt-2 px-1">
                Les pensées disparaissent à la fermeture — c&apos;est voulu.
              </p>
            </div>
          </div>
        )}

        <div className="backdrop-blur-md bg-black/80 border-t border-white/10 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <span className="text-xs text-gray-500 shrink-0">Capture rapide</span>
            <input
              ref={captureInputRef}
              type="text"
              value={thoughtInput}
              onChange={(e) => setThoughtInput(e.target.value.slice(0, 200))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addThought();
                }
              }}
              placeholder="Une pensée, une idée..."
              className="flex-1 bg-transparent text-base text-left text-white placeholder-gray-600 focus:outline-none px-0"
            />
            <button
              type="button"
              onClick={addThought}
              disabled={thoughtInput.trim().length < 2}
              className="shrink-0 text-sm text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
