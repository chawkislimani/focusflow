"use client";

import { useState } from "react";
import Brand from "./Brand";
import FocusState from "./FocusState";
import Hero from "./Hero";
import TaskInput from "./TaskInput";
import CTA from "./CTA";
import QuickPrompts from "./QuickPrompts";
import Thinking from "./Thinking";
import TaskRecap from "./TaskRecap";
import StepList from "./StepList";
import ProgressStrip from "./ProgressStrip";
import CaptureDock from "./CaptureDock";

export type MicroStep = {
  t: string;
  m: string;
  soft?: boolean;
};

export type Thought = {
  id: number;
  text: string;
  time: string;
  kind: string | null;
};

export type AppState = "empty" | "loading" | "results";

function fakeBreakdown(task: string): MicroStep[] {
  const t = (task || "").toLowerCase();
  if (t.includes("rapport") || t.includes("présentation") || t.includes("present")) {
    return [
      { t: "Ouvrir le doc et relire la dernière section écrite", m: "3 min" },
      { t: "Lister 3 idées-clés à développer (juste des bullets)", m: "8 min" },
      { t: "Écrire l'intro — un paragraphe brut, on corrigera après", m: "12 min" },
      { t: "Pause café, étirements", m: "5 min", soft: true },
      { t: "Développer la première idée-clé en 2 paragraphes", m: "15 min" },
      { t: "Relire à voix haute, marquer les passages flous", m: "7 min" },
    ];
  }
  if (t.includes("ranger") || t.includes("appartement") || t.includes("ménage")) {
    return [
      { t: "Mettre une playlist qui te plaît", m: "1 min" },
      { t: "Sortir un sac poubelle, faire le tour des surfaces", m: "5 min" },
      { t: "Tout ce qui traîne sur le canapé → à sa place", m: "8 min" },
      { t: "Vaisselle dans l'évier seulement (pas plus)", m: "10 min" },
      { t: "S'asseoir, regarder le résultat, te féliciter", m: "2 min", soft: true },
    ];
  }
  if (t.includes("sport") || t.includes("courir") || t.includes("muscu")) {
    return [
      { t: "Sortir les vêtements de sport et les poser visibles", m: "2 min" },
      { t: "Enfiler la tenue (juste ça, rien d'autre)", m: "3 min" },
      { t: "Mettre les chaussures et sortir de chez toi", m: "2 min" },
      { t: "Marcher 5 minutes pour s'échauffer", m: "5 min" },
      { t: "10 minutes d'effort, peu importe l'intensité", m: "10 min" },
    ];
  }
  return [
    { t: "Identifier la toute première micro-action concrète", m: "2 min" },
    { t: "Préparer l'environnement (fermer onglets, eau, casque)", m: "4 min" },
    { t: "Faire la première étape — sans la juger", m: "10 min" },
    { t: "Mini-pause, respirer", m: "3 min", soft: true },
    { t: "Continuer 10 min ou s'arrêter, ton choix", m: "10 min" },
  ];
}

function categorizeThought(text: string): string | null {
  const lower = text.toLowerCase();
  if (/\b(idée|peut-être|si on|et si)\b/.test(lower)) return "idée";
  if (/\b(faire|appeler|envoyer|acheter|rappel|noter)\b/.test(lower)) return "todo";
  if (lower.length < 40) return "note";
  return null;
}

export default function FocusFlowApp() {
  const [task, setTask] = useState("");
  const [mood, setMood] = useState("mid");
  const [loading, setLoading] = useState(false);
  const [steps, setSteps] = useState<MicroStep[]>([]);
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [thoughts, setThoughts] = useState<Thought[]>([]);

  const appState: AppState =
    loading ? "loading" : steps.length > 0 ? "results" : "empty";

  const doneCount = Object.values(checked).filter(Boolean).length;

  async function submitTask(taskText: string) {
    if (!taskText.trim() || loading) return;
    setTask(taskText);
    setLoading(true);
    setSteps([]);
    setChecked({});
    await new Promise((r) => setTimeout(r, 1300));
    setSteps(fakeBreakdown(taskText));
    setLoading(false);
  }

  async function submit() {
    await submitTask(task);
  }

  function transformThought(thought: Thought) {
    setThoughts((prev) => prev.filter((t) => t.id !== thought.id));
    submitTask(thought.text);
  }

  function addThought(text: string) {
    const time = new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const kind = categorizeThought(text);
    setThoughts((prev) =>
      [{ id: Date.now(), text, time, kind }, ...prev].slice(0, 50)
    );
  }

  function resplit(index: number) {
    setSteps((prev) => {
      const next = [...prev];
      const orig = next[index];
      const half = Math.max(2, Math.round(parseInt(orig.m) / 2));
      next.splice(
        index,
        1,
        { t: `${orig.t} — partie 1 : la commencer`, m: `${half} min` },
        { t: `${orig.t} — partie 2 : la finir`, m: `${half} min` }
      );
      return next;
    });
  }

  function reset() {
    setSteps([]);
    setChecked({});
    setTask("");
  }

  return (
    <>
      <div className="relative z-10 max-w-[880px] mx-auto px-8 pt-7 pb-[180px] max-[720px]:px-[18px] max-[720px]:pb-[200px]">
        {/* Topbar */}
        <div className="flex items-center justify-between pb-8">
          <Brand />
          <FocusState count={thoughts.length} />
        </div>

        {/* Hero */}
        <Hero state={appState} />

        {/* Empty / loading state */}
        {appState !== "results" && (
          <>
            <TaskInput
              value={task}
              onChange={setTask}
              onSubmit={submit}
              mood={mood}
              setMood={setMood}
            />
            <div className="mt-[18px] flex items-center gap-[14px] flex-wrap">
              <CTA onClick={submit} disabled={!task.trim()} loading={loading} />
              <span className="font-serif italic text-ink-faint text-base">
                ou{" "}
                <span className="border-b border-dotted border-current">
                  ⌘ + Entrée
                </span>
              </span>
            </div>
            {loading && <Thinking />}
            {!loading && !task && <QuickPrompts onPick={setTask} />}
          </>
        )}

        {/* Results state */}
        {appState === "results" && (
          <>
            <TaskRecap task={task} onReset={reset} />
            <StepList
              steps={steps}
              checked={checked}
              onToggle={(i) =>
                setChecked((prev) => ({ ...prev, [i]: !prev[i] }))
              }
              onResplit={resplit}
            />
            <ProgressStrip done={doneCount} total={steps.length} />
          </>
        )}
      </div>

      <CaptureDock thoughts={thoughts} onAdd={addThought} onTransform={transformThought} />
    </>
  );
}
