interface Props {
  done: number;
  total: number;
}

export default function ProgressStrip({ done, total }: Props) {
  if (total === 0) return null;

  const pct = Math.round((done / total) * 100);

  const phrase =
    pct === 0
      ? "tu peux commencer par la première"
      : pct < 50
        ? "le plus dur est fait — tu as commencé"
        : pct < 100
          ? "tu es plus qu'à la moitié"
          : "bravo. fais une pause.";

  return (
    <div className="mt-[22px] bg-paper-2 border border-rule rounded-[14px] px-[18px] py-4 flex items-center gap-4">
      <div className="font-mono text-[11px] text-ink-soft shrink-0 tabular-nums">
        <span className="text-ink font-semibold">{done}</span>/{total}
      </div>

      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(14,11,7,.08)" }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, #FF5A1F, #FF8050)",
            boxShadow: pct > 0 ? "0 0 12px rgba(255,90,31,.45)" : "none",
            transition: "width 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </div>

      <p className="font-serif italic text-[16px] text-ink-soft shrink-0 max-[720px]:hidden">
        {phrase}
      </p>
    </div>
  );
}
