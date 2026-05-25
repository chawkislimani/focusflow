import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { containsIllegalContent, validateMessage } from "./contentFilter";

export interface StoredShare {
  task: string;
  steps: Array<{ t: string; m: string; soft?: boolean }>;
  message: string;
  createdAt: number;
}

const MAX_TASK_LEN = 500;
const MAX_STEP_T_LEN = 120;
const MAX_STEP_M_LEN = 20;
const MAX_MSG_LEN = 150;
const MAX_STEPS = 20;

// Module-level in-memory store (survives within process lifetime)
const shares = new Map<string, StoredShare>();

// Attempt disk persistence — works on VPS, silently skipped on read-only serverless
const STORE_FILE = join(process.cwd(), ".share-data.json");

function tryLoad(): void {
  try {
    if (!existsSync(STORE_FILE)) return;
    const raw = JSON.parse(readFileSync(STORE_FILE, "utf8"));
    for (const [id, record] of Object.entries(raw)) {
      shares.set(id, record as StoredShare);
    }
  } catch {
    // ignore — start with empty memory store
  }
}

function tryPersist(): void {
  try {
    const obj: Record<string, StoredShare> = {};
    for (const [id, record] of shares) obj[id] = record;
    writeFileSync(STORE_FILE, JSON.stringify(obj), "utf8");
  } catch {
    // read-only filesystem (Vercel Lambda) — memory-only mode, silently ignored
  }
}

tryLoad();

const ID_CHARS = "abcdefghjkmnpqrstuvwxyz23456789"; // no ambiguous chars (l,o,i,0,1)

function generateId(): string {
  let id = "";
  for (let i = 0; i < 7; i++) {
    id += ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)];
  }
  return id;
}

export function validateShareInput(body: unknown): StoredShare | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const b = body as Record<string, unknown>;

  if (typeof b.task !== "string" || b.task.length < 1 || b.task.length > MAX_TASK_LEN) return null;
  if (containsIllegalContent(b.task)) return null;

  if (!Array.isArray(b.steps) || b.steps.length === 0 || b.steps.length > MAX_STEPS) return null;
  for (const step of b.steps) {
    if (!step || typeof step !== "object" || Array.isArray(step)) return null;
    const s = step as Record<string, unknown>;
    if (typeof s.t !== "string" || s.t.length < 1 || s.t.length > MAX_STEP_T_LEN) return null;
    if (typeof s.m !== "string" || s.m.length < 1 || s.m.length > MAX_STEP_M_LEN) return null;
    if (s.soft !== undefined && typeof s.soft !== "boolean") return null;
    if (containsIllegalContent(s.t)) return null;
  }

  if (typeof b.message !== "string" || b.message.length > MAX_MSG_LEN) return null;
  if (b.message && !validateMessage(b.message).valid) return null;

  return {
    task: b.task as string,
    steps: (b.steps as Array<{ t: string; m: string; soft?: boolean }>).map((s) => ({
      t: s.t,
      m: s.m,
      ...(s.soft ? { soft: true } : {}),
    })),
    message: b.message as string,
    createdAt: Date.now(),
  };
}

export function createShare(record: StoredShare): string {
  // Trim oldest entries if store grows too large
  if (shares.size >= 10_000) {
    const oldest = [...shares.entries()]
      .sort((a, b) => a[1].createdAt - b[1].createdAt)
      .slice(0, 2_000)
      .map(([id]) => id);
    for (const id of oldest) shares.delete(id);
  }

  let id: string;
  do {
    id = generateId();
  } while (shares.has(id));

  shares.set(id, record);
  tryPersist();
  return id;
}

export function getShare(id: string): StoredShare | null {
  return shares.get(id) ?? null;
}
