import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const client = new Anthropic();

const SYSTEM = `Tu es un assistant spécialisé pour les personnes TDAH.
Quand on te donne une tâche, décompose-la en 4 à 6 micro-étapes concrètes et immédiatement actionnables.
Chaque étape doit être simple, spécifique, et faisable en moins de 15 minutes.

Si la tâche demandée est illégale, dangereuse, ou moralement inappropriée, refuse poliment sans fournir d'étapes.

Réponds UNIQUEMENT avec un objet JSON, sans markdown, sans explication.
En cas de refus : {"error": "message de refus poli"}
Sinon : {"steps": ["étape 1", "étape 2", "étape 3", "étape 4"]}`;

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

  if (!task || typeof task !== "string" || !task.trim()) {
    return Response.json({ error: "La tâche est requise." }, { status: 400 });
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
      messages: [{ role: "user", content: task.trim() }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return Response.json({ error: "Pas de réponse du modèle." }, { status: 500 });
    }

    let parsed: { steps?: string[]; error?: string };
    try {
      parsed = JSON.parse(textBlock.text);
    } catch {
      return Response.json({ error: "Réponse du modèle invalide." }, { status: 500 });
    }

    if (parsed.error) {
      return Response.json(
        { error: "On est là pour t'aider à avancer sur des choses concrètes et positives — pas pour ça. 🙂" },
        { status: 422 }
      );
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
