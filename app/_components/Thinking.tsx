export default function Thinking() {
  return (
    <div className="flex items-center gap-4 mt-8 animate-fade-slide">
      <div
        className="w-[26px] h-[26px] rounded-full shrink-0 animate-orb"
        style={{
          background:
            "radial-gradient(circle at 35% 30%, #FFB084 0%, #FF5A1F 55%, #C13E0F 100%)",
          boxShadow: "0 0 24px rgba(255,90,31,.5)",
        }}
      />
      <span className="font-serif italic text-[24px] text-ink-soft leading-none">
        L&apos;IA réfléchit à ta place
        <span aria-hidden>
          {[0, 1, 2].map((i) => (
            <b
              key={i}
              className="animate-dots not-italic font-normal"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              .
            </b>
          ))}
        </span>
      </span>
    </div>
  );
}
