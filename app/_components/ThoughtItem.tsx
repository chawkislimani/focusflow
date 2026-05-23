import type { Thought } from "./FocusFlowApp";

export default function ThoughtItem({ thought }: { thought: Thought }) {
  return (
    <div className="flex items-start gap-3 bg-paper-card border border-rule rounded-[14px] px-4 py-3 animate-thought-in">
      <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-ink-faint shrink-0 pt-0.5">
        {thought.time}
      </span>
      <span className="font-sans text-[14.5px] leading-[1.45] text-ink flex-1">
        {thought.text}
      </span>
      {thought.kind && (
        <span className="font-mono text-[10px] text-accent-deep bg-accent-soft px-[7px] py-0.5 rounded-[4px] shrink-0 leading-none self-start mt-0.5">
          {thought.kind}
        </span>
      )}
    </div>
  );
}
