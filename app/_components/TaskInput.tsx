"use client";

import { useEffect, useRef } from "react";

const MOODS = [
  { id: "low", label: "énergie basse" },
  { id: "mid", label: "moyen" },
  { id: "high", label: "énergie haute" },
  { id: "panic", label: "panique" },
] as const;

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  mood: string;
  setMood: (m: string) => void;
}

export default function TaskInput({
  value,
  onChange,
  onSubmit,
  mood,
  setMood,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div className="bg-paper-card border border-rule rounded-[22px] p-[22px] pb-[18px] shadow-soft focus-within:border-ink focus-within:shadow-task-focus transition-[border-color,box-shadow] duration-150">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            onSubmit();
          }
        }}
        placeholder="Décris la tâche qui te bloque, même vaguement…"
        maxLength={500}
        rows={3}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="sentences"
        spellCheck={false}
        className="w-full bg-transparent font-serif text-[26px] leading-[1.35] text-ink min-h-[96px] resize-none outline-none placeholder:italic placeholder:text-ink-faint max-[720px]:text-[20px] max-[720px]:min-h-[80px]"
      />

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-dashed border-rule pt-[10px] mt-[6px]">
        {/* Mood chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {MOODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMood(m.id)}
              className={`font-mono text-[10.5px] px-2.5 py-[5px] rounded-full border transition-colors duration-100 cursor-default leading-none ${
                mood === m.id
                  ? "bg-ink text-paper border-ink"
                  : "bg-paper-2 text-ink-soft border-rule hover:bg-white"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Character counter */}
        <div className="font-mono text-[11px] text-ink-faint shrink-0 tabular-nums">
          <span className="text-ink-soft">{value.length}</span> / 500
        </div>
      </div>
    </div>
  );
}
