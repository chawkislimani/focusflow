import { NextRequest } from "next/server";
import { createShare, validateShareInput } from "../../_lib/shareStore";

// Reuse same sliding-window rate limiter pattern as /api/breakdown
const ipRequests = new Map<string, number[]>();
const MAX_SHARES = 20;
const WINDOW_MS = 60 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipRequests.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (timestamps.length >= MAX_SHARES) return true;
  ipRequests.set(ip, [...timestamps, now]);
  return false;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return Response.json(
      { error: "Trop de liens créés, réessaie dans une heure." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const record = validateShareInput(body);
  if (!record) {
    return Response.json({ error: "Contenu invalide." }, { status: 400 });
  }

  const id = createShare(record);
  return Response.json({ id });
}
