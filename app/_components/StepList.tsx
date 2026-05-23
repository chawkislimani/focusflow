import type { MicroStep } from "./FocusFlowApp";
import Step from "./Step";

interface Props {
  steps: MicroStep[];
  checked: Record<number, boolean>;
  onToggle: (i: number) => void;
  onResplit: (i: number) => void;
}

export default function StepList({ steps, checked, onToggle, onResplit }: Props) {
  const totalMin = steps.reduce((a, s) => a + (parseInt(s.m) || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-baseline justify-between mt-4 mb-[18px]">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
          — micro-étapes
        </span>
        <span className="font-mono text-[11px] text-ink-soft">
          <span className="text-accent font-semibold">{steps.length}</span>
          {" "}étapes · ≈ {totalMin} min
        </span>
      </div>

      {/* Steps */}
      <div className="flex flex-col gap-2">
        {steps.map((s, i) => (
          <Step
            key={i}
            index={i}
            step={s}
            checked={!!checked[i]}
            onToggle={() => onToggle(i)}
            onResplit={() => onResplit(i)}
          />
        ))}
      </div>
    </div>
  );
}
