import type { MicroStep } from "./FocusFlowApp";

interface Props {
  index: number;
  step: MicroStep;
  checked: boolean;
  onToggle: () => void;
  onResplit: () => void;
}

export default function Step({
  index,
  step,
  checked,
  onToggle,
  onResplit,
}: Props) {
  return (
    <div
      className="grid items-center bg-paper-card border border-rule rounded-[16px] px-[18px] py-4 pl-[14px] hover:bg-white hover:border-[#C7BFA9] transition-colors duration-100 animate-step-in max-[720px]:pl-[10px] max-[720px]:py-[14px] max-[720px]:px-[14px]"
      style={{
        gridTemplateColumns: "44px 1fr auto",
        gap: 18,
        animationDelay: `${index * 70}ms`,
      }}
    >
      {/* Step number */}
      <div
        className={`w-10 h-10 grid place-items-center border-r border-rule font-serif italic text-[28px] leading-none transition-colors duration-150 max-[720px]:w-9 max-[720px]:h-9 max-[720px]:text-[22px] ${
          checked ? "text-ink-faint" : "text-ink-soft"
        }`}
      >
        {String(index + 1).padStart(2, "0")}
      </div>

      {/* Body */}
      <div>
        <div
          className={`font-sans font-medium text-[17px] leading-[1.35] transition-colors duration-150 max-[720px]:text-[15px] ${
            checked
              ? "text-ink-faint line-through decoration-accent decoration-[1.5px]"
              : "text-ink"
          }`}
        >
          {step.t}
        </div>
        <div className="flex items-center gap-[10px] mt-1 font-mono text-[11px] text-ink-soft">
          <span className="text-accent">◷</span>
          <span>{step.m}</span>
          {!step.soft && (
            <button
              type="button"
              onClick={onResplit}
              className="text-ink-faint border-b border-dotted border-current hover:text-accent hover:border-accent transition-colors duration-100 cursor-default"
            >
              trop gros, redécoupe
            </button>
          )}
          {step.soft && (
            <span className="font-serif italic text-ink-faint">respire</span>
          )}
        </div>
      </div>

      {/* Checkbox */}
      <button
        type="button"
        onClick={onToggle}
        aria-label={checked ? "marquer non-terminé" : "terminer"}
        className={`w-7 h-7 rounded-full border-[1.5px] flex items-center justify-center transition-all duration-150 shrink-0 ${
          checked
            ? "bg-accent border-accent"
            : "border-rule hover:border-ink-soft"
        }`}
      >
        {checked && (
          <span
            style={{
              display: "block",
              width: 5,
              height: 9,
              borderRight: "2px solid white",
              borderBottom: "2px solid white",
              transform: "rotate(45deg) translate(-1px, -1px)",
            }}
          />
        )}
      </button>
    </div>
  );
}
