import { getShare } from "../../_lib/shareStore";
import ShareView from "../ShareView";

export const metadata = {
  title: "Coup de pouce — FocusFlow",
  description: "Quelqu'un t'a envoyé un coup de pouce via FocusFlow.",
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const share = /^[a-z0-9]{7}$/.test(id) ? getShare(id) : null;

  if (!share) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft mb-4">
          FocusFlow
        </p>
        <h1 className="font-serif text-[32px] text-ink mb-3">Lien introuvable</h1>
        <p className="font-sans text-[15px] text-ink-soft max-w-xs">
          Ce lien n&apos;existe pas ou a expiré. Demande à l&apos;expéditeur de
          t&apos;en envoyer un nouveau.
        </p>
        <a
          href="/"
          className="mt-8 font-sans text-[14px] font-medium text-accent border-b border-accent pb-0.5"
        >
          Ouvrir FocusFlow
        </a>
      </div>
    );
  }

  return (
    <ShareView
      preloadedPayload={{
        task: share.task,
        steps: share.steps,
        message: share.message,
      }}
    />
  );
}
