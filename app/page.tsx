"use client";

import { useState } from "react";

export default function Home() {
  const [task, setTask] = useState("");
  const [steps, setSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!task.trim()) return;

    setLoading(true);
    setError("");
    setSteps([]);

    try {
      const res = await fetch("/api/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 bg-white dark:bg-zinc-950">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
          Quelle est ta tâche&nbsp;?
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mb-8">
          Une tâche floue. Des étapes claires.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Ex : Finir mon rapport de stage..."
            rows={4}
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 resize-none focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600"
          />
          <button
            type="submit"
            disabled={loading || !task.trim()}
            className="w-full rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "En cours…" : "Découper en micro-étapes"}
          </button>
        </form>

        {error && (
          <p className="mt-6 text-sm text-red-500">{error}</p>
        )}

        {steps.length > 0 && (
          <ol className="mt-8 flex flex-col gap-3">
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
  );
}
