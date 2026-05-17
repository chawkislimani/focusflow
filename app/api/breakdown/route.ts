import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

function sanitizeInput(text: string): string {
  return text.trim().replace(/[\x00-\x1F\x7F]/g, "");
}

const INJECTION_PATTERNS = [
  /ignore/i,
  /oublie/i,
  /system\s*prompt/i,
  /jailbreak/i,
  /act\s+as/i,
  /tu\s+es\s+maintenant/i,
  /you\s+are\s+now/i,
  /pretend/i,
  /roleplay/i,
  /###/,
  /---system/i,
  /<\|[^|]+\|>/i,
  /\[inst\]/i,
];

const ILLEGAL_KEYWORDS = [
  /drogue/i,
  /cocaine/i,
  /hero[iï]ne/i,
  /trafic/i,
  /\barme\b/i,
  /explosif/i,
  /bombe/i,
  /attentat/i,
  /p[eé]dophilie/i,
  /\bviol\b/i,
  /meurtre/i,
  /assassin/i,
  /suicide/i,
  /automutilation/i,
  /\bhack\b/i,
  /pirater/i,
  /ransomware/i,
  /phishing/i,
  /blanchiment/i,
  /fraude\s+fiscale/i,
];

function validateInput(text: string): { valid: boolean; error?: string } {
  if (text.length < 3) {
    return { valid: false, error: "Décris ta tâche en quelques mots." };
  }
  if (text.length > 500) {
    return { valid: false, error: "Limite ta tâche à 500 caractères." };
  }
  if (INJECTION_PATTERNS.some((p) => p.test(text))) {
    return { valid: false, error: "Ce type de contenu n'est pas pris en charge." };
  }
  if (ILLEGAL_KEYWORDS.some((p) => p.test(text))) {
    return { valid: false, error: "Ce type de contenu ne peut pas être traité par FocusFlow." };
  }
  return { valid: true };
}

const SYSTEM = `Tu es un assistant de productivité bienveillant pour personnes TDAH.
Tu aides à décomposer des tâches du quotidien en micro-étapes actionnables.
RÈGLES ABSOLUES :
- Si la tâche décrit une activité illégale, dangereuse, violente, ou inappropriée, réponds UNIQUEMENT avec ce JSON : {"error": "Cette tâche ne peut pas être découpée par FocusFlow."}
- Si la demande n'est pas une tâche concrète à accomplir, réponds UNIQUEMENT avec ce JSON : {"error": "Décris une tâche concrète à accomplir."}
- Sinon, réponds UNIQUEMENT avec un JSON valide : {"steps": ["étape 1", "étape 2", ...]} avec 4 à 6 micro-étapes courtes et actionnables.`;

// In-memory sliding window rate limiter (V1 — resets on server restart)
const ipRequests = new Map<string, number[]>();
const MAX_REQUESTS = 10;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipRequests.get(ip) ?? []).filter(
    (t) => now - t < WINDOW_MS
  );
  if (timestamps.length >= MAX_REQUESTS) return true;
  ipRequests.set(ip, [...timestamps, now]);
  return false;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown";

  if (isRateLimited(ip)) {
    return Response.json(
      { error: "Trop de requêtes, réessaie dans une heure." },
      { status: 429 }
    );
  }

  let task: string;
  try {
    const body = await request.json();
    task = body?.task;
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  if (!task || typeof task !== "string") {
    return Response.json({ error: "La tâche est requise." }, { status: 400 });
  }

  task = sanitizeInput(task);

  const validation = validateInput(task);
  if (!validation.valid) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: SYSTEM,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: task }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return Response.json({ error: "Pas de réponse du modèle." }, { status: 500 });
    }

    const rawText = textBlock.text;
    console.log('Raw response:', rawText);

    const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let parsed: { steps?: string[]; error?: string };
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return Response.json({ error: "Réponse du modèle invalide." }, { status: 500 });
    }

    if (parsed.error) {
      return Response.json({ error: parsed.error }, { status: 400 });
    }

    if (!Array.isArray(parsed.steps) || parsed.steps.length === 0) {
      return Response.json({ error: "Format de réponse inattendu." }, { status: 500 });
    }

    return Response.json({ steps: parsed.steps });
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      return Response.json(
        { error: error.message },
        { status: error.status ?? 500 }
      );
    }
    return Response.json({ error: "Erreur interne." }, { status: 500 });
  }
}
