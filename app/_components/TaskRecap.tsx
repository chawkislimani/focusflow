interface Props {
  task: string;
  onReset: () => void;
}

export default function TaskRecap({ task, onReset }: Props) {
  return (
    <div className="bg-paper-card border border-rule rounded-[22px] px-[22px] py-4 shadow-soft mb-6">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="font-mono text-[11px] uppercase tracking-[0.16em] text-ink-soft mb-1.5">
            ta tâche
          </div>
          <div className="font-serif text-[24px] leading-[1.3] text-ink">
            {task}
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="shrink-0 font-mono text-[11px] uppercase tracking-[0.08em] border border-rule text-ink-soft rounded-full px-[14px] py-2 hover:border-ink hover:text-ink transition-colors duration-100 cursor-default leading-none"
        >
          nouvelle tâche
        </button>
      </div>
    </div>
  );
}
