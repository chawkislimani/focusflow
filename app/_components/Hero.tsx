import type { AppState } from "./FocusFlowApp";

const subtitles: Record<AppState, string> = {
  empty: "Une tâche floue. Des étapes claires. L'IA découpe pour toi.",
  loading: "On découpe ça en morceaux digestes…",
  results: "Voilà. Coche au fur et à mesure, à ton rythme.",
};

export default function Hero({ state }: { state: AppState }) {
  return (
    <div className="pt-10 pb-[26px]">
      {/* Eyebrow */}
      <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft mb-5">
        <span className="text-accent">01</span> — découpage cognitif
      </div>

      {/* H1 */}
      <h1 className="hero-heading font-serif text-ink leading-[0.92] tracking-tight mb-5 max-[720px]:leading-[1.05]">
        Quelle est ta{" "}
        <span className="italic text-accent">tâche</span>
        <span className="text-ink-faint"> ?</span>
        <span
          className="inline-block bg-ink align-middle ml-1 animate-blink"
          style={{ width: "0.06em", height: "0.82em" }}
        />
      </h1>

      {/* Subtitle */}
      <p
        className="font-serif italic text-ink-soft max-w-[520px] leading-[1.4] max-[720px]:text-[18px]"
        style={{ fontSize: 22 }}
      >
        {subtitles[state]}
      </p>
    </div>
  );
}
