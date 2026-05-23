"use client";

import { useState, useRef } from "react";
import type { Thought } from "./FocusFlowApp";
import ThoughtItem from "./ThoughtItem";

interface Props {
  thoughts: Thought[];
  onAdd: (text: string) => void;
}

export default function CaptureDock({ thoughts, onAdd }: Props) {
  const [val, setVal] = useState("");
  const sendRef = useRef<HTMLButtonElement>(null);

  function fireConfetti() {
    if (!sendRef.current) return;
    const r = sendRef.current.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;

    for (let i = 0; i < 10; i++) {
      const dot = document.createElement("div");
      dot.className = "confetti-dot";
      const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.4;
      const rad = 30 + Math.random() * 36;
      dot.style.setProperty("--tx", `${Math.cos(angle) * rad}px`);
      dot.style.setProperty("--ty", `${Math.sin(angle) * rad - 20}px`);
      dot.style.left = `${cx}px`;
      dot.style.top = `${cy}px`;
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 1000);
    }
  }

  function submit() {
    const trimmed = val.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setVal("");
    fireConfetti();
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none px-8 pb-5 max-[720px]:px-[14px] max-[720px]:pb-[14px]"
      style={{
        paddingTop: 60,
        background: "linear-gradient(180deg, transparent 0%, #F2EDE3 40%)",
      }}
    >
      <div className="max-w-[880px] mx-auto pointer-events-auto">
        {/* Thoughts stack — most recent at bottom, scrollable */}
        {thoughts.length > 0 && (
          <div
            className="flex flex-col-reverse gap-2 max-h-[220px] overflow-y-auto mb-3 pb-1"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent 0%, black 30%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 30%)",
            }}
          >
            {thoughts.map((th) => (
              <ThoughtItem key={th.id} thought={th} />
            ))}
          </div>
        )}

        {/* Capture bar */}
        <div className="flex items-center gap-[14px] bg-ink rounded-full shadow-dock pl-[22px] pr-[6px] py-[6px] focus-within:-translate-y-[3px] focus-within:shadow-dock-hover transition-all duration-150">
          {/* Tag */}
          <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[rgba(242,237,227,.5)] border-r border-[rgba(242,237,227,.16)] pr-[14px] shrink-0 whitespace-nowrap max-[720px]:hidden">
            capture rapide
          </span>

          {/* Input */}
          <input
            type="text"
            value={val}
            onChange={(e) => setVal(e.target.value.slice(0, 200))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            placeholder="Une pensée, une idée, une distraction…"
            className="flex-1 bg-transparent text-paper text-[16px] font-sans outline-none caret-accent placeholder:font-serif placeholder:italic placeholder:text-[18px] placeholder:text-[rgba(242,237,227,.4)]"
          />

          {/* Enter hint */}
          <span className="font-mono text-[10px] text-[rgba(242,237,227,.45)] shrink-0 max-[720px]:hidden">
            ⏎
          </span>

          {/* Send button */}
          <button
            ref={sendRef}
            type="button"
            onClick={submit}
            aria-label="capturer"
            className="w-11 h-11 rounded-full bg-accent text-ink flex items-center justify-center text-[18px] font-light shrink-0 hover:scale-[1.07] hover:rotate-90 hover:bg-[#FF7A47] active:scale-[.95] transition-all duration-150"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
