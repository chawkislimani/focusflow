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
      className="group flex items-center gap-3.5 bg-ink text-paper font-sans font-semibold text-base px-6.5 py-4.5 rounded-full shadow-cta transition-all duration-150 ease-[cubic-bezier(.34,1.56,.64,1)] hover:-translate-y-0.5 hover:bg-accent hover:shadow-cta-hover active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-ink disabled:hover:shadow-cta"
    >
      <span>{loading ? "Découpage en cours" : "Découper en micro-étapes"}</span>
      <span className="font-mono text-[11px] bg-[rgba(255,255,255,.13)] text-[rgba(242,237,227,.8)] px-1.75 py-1 rounded-md leading-none max-[720px]:hidden">
        ⌘ ⏎
      </span>
      <span className="w-5.5 h-5.5 rounded-full bg-accent text-ink flex items-center justify-center text-sm font-medium transition-colors duration-150 group-hover:bg-paper group-disabled:bg-accent max-[720px]:hidden">
        →
      </span>
    </button>
  );
}
