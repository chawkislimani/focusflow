interface Props {
  onClick: () => void;
  disabled: boolean;
  loading: boolean;
}

export default function CTA({ onClick, disabled, loading }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="group flex items-center gap-[14px] bg-ink text-paper font-sans font-semibold text-base px-[26px] py-[18px] rounded-full shadow-cta transition-all duration-150 ease-[cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-0.5 hover:bg-accent hover:shadow-cta-hover active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-ink disabled:hover:shadow-cta"
    >
      <span>{loading ? "Découpage en cours" : "Découper en micro-étapes"}</span>
      <span className="font-mono text-[11px] bg-[rgba(255,255,255,.13)] text-[rgba(242,237,227,.8)] px-[7px] py-1 rounded-[6px] leading-none">
        ⌘ ⏎
      </span>
      <span className="w-[22px] h-[22px] rounded-full bg-accent text-ink flex items-center justify-center text-sm font-medium transition-colors duration-150 group-hover:bg-paper group-disabled:bg-accent">
        →
      </span>
    </button>
  );
}
