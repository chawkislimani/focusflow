const SUGGESTIONS = [
  "Finir le rapport de stage",
  "Préparer la présentation client",
  "Ranger l'appartement",
  "Reprendre le sport",
] as const;

export default function QuickPrompts({
  onPick,
}: {
  onPick: (s: string) => void;
}) {
  return (
    <div className="mt-[22px] flex flex-wrap gap-2">
      {SUGGESTIONS.map((s, i) => (
        <button
          key={s}
          type="button"
          onClick={() => onPick(s)}
          className="group flex items-center gap-2 font-serif italic text-[17px] text-ink-soft bg-[rgba(255,255,255,.5)] border border-rule px-[14px] py-[10px] rounded-full transition-all duration-150 hover:bg-ink hover:text-paper hover:-translate-y-[1px]"
        >
          <span className="font-mono text-[11px] text-accent not-italic border border-current px-1.5 py-[1px] rounded-[4px] group-hover:text-accent-soft group-hover:border-accent-soft leading-none">
            {String(i + 1).padStart(2, "0")}
          </span>
          {s}
        </button>
      ))}
    </div>
  );
}
