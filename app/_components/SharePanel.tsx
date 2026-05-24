"use client";

import { useState } from "react";
import type { MicroStep } from "./FocusFlowApp";
import { validateMessage } from "../_lib/contentFilter";
import { encodeSharePayload } from "../_lib/sharePayload";

interface Props {
  task: string;
  steps: MicroStep[];
}

export default function SharePanel({ task, steps }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function close() {
    setOpen(false);
    setLink(null);
    setMessage("");
    setError(null);
  }

  function generate() {
    const trimmed = message.trim();
    const validation = validateMessage(trimmed);
    if (!validation.valid) {
      setError(validation.error ?? "Message invalide.");
      return;
    }
    const encoded = encodeSharePayload({ v: 1, task, steps, message: trimmed });
    setLink(`${window.location.origin}/partage?d=${encoded}`);
    setError(null);
  }

  async function copy() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // clipboard unavailable — do nothing
    }
  }

  if (!open) {
    return (
      <div className="mt-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full font-sans text-[14px] text-ink-soft border border-dashed border-rule rounded-[14px] px-4 py-3 hover:border-ink-soft hover:text-ink transition-colors duration-150 cursor-default"
        >
          Envoyer un coup de pouce à quelqu&apos;un →
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-paper-card border border-rule rounded-[18px] p-5 animate-fade-slide">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">
          Envoyer un coup de pouce
        </span>
        <button
          type="button"
          onClick={close}
          className="font-mono text-[10px] text-ink-faint hover:text-ink transition-colors duration-100 cursor-default"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>

      {!link ? (
        <>
          {/* Message textarea */}
          <label className="block font-sans text-[13px] text-ink-soft mb-2">
            Ajouter un mot{" "}
            <span className="text-ink-faint">(facultatif, 150 car. max)</span>
          </label>
          <textarea
            maxLength={150}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setError(null);
            }}
            placeholder="Je pense à toi, tu peux y arriver."
            rows={3}
            className="w-full bg-paper border border-rule rounded-[10px] px-3 py-2 font-sans text-[14px] text-ink placeholder:text-ink-faint resize-none focus:outline-none focus:border-ink-soft transition-colors duration-100"
          />
          <div className="flex items-center justify-between mt-1 mb-4">
            <span className="font-mono text-[11px] text-ink-faint">
              {message.length}/150
            </span>
            {error && (
              <span className="font-sans text-[12px] text-accent">{error}</span>
            )}
          </div>

          <button
            type="button"
            onClick={generate}
            className="w-full bg-ink text-paper-card rounded-[10px] py-[11px] font-sans font-medium text-[14px] hover:bg-ink-2 transition-colors duration-150 cursor-default"
          >
            Générer le lien de partage
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <p className="font-sans text-[13px] text-ink-soft">
            Lien prêt — partage-le comme tu veux :
          </p>

          {/* Link display + copy */}
          <div className="flex gap-2 items-stretch">
            <div className="flex-1 min-w-0 font-mono text-[11px] text-ink-soft bg-paper border border-rule rounded-[10px] px-3 py-2 overflow-hidden text-ellipsis whitespace-nowrap">
              {link}
            </div>
            <button
              type="button"
              onClick={copy}
              className={`shrink-0 px-4 rounded-[10px] font-sans text-[13px] font-medium transition-all duration-200 cursor-default ${
                copied
                  ? "bg-ok text-white"
                  : "bg-ink text-paper-card hover:bg-ink-2"
              }`}
            >
              {copied ? "Copié ✓" : "Copier"}
            </button>
          </div>

          <p className="font-mono text-[11px] text-ink-faint">
            Ce lien n&apos;expire pas.
          </p>
        </div>
      )}
    </div>
  );
}
