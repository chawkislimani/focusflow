import { containsIllegalContent, validateMessage } from "./contentFilter";

export interface SharePayload {
  v: 1;
  task: string;
  steps: Array<{ t: string; m: string; soft?: boolean }>;
  message: string;
}

const MAX_STEPS = 20;
const MAX_TASK_LEN = 500;
const MAX_STEP_T_LEN = 120;
const MAX_STEP_M_LEN = 20;
const MAX_MSG_LEN = 150;

function toUrlBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function fromUrlBase64(encoded: string): Uint8Array<ArrayBuffer> {
  const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function encodeSharePayload(payload: SharePayload): Promise<string> {
  const json = JSON.stringify(payload);
  const input = new TextEncoder().encode(json);
  const cs = new CompressionStream("deflate-raw");
  const writer = cs.writable.getWriter();
  await writer.write(input);
  await writer.close();
  const compressed = new Uint8Array(await new Response(cs.readable).arrayBuffer());
  return toUrlBase64(compressed);
}

export async function decodeSharePayload(encoded: string): Promise<SharePayload | null> {
  if (!encoded || encoded.length > 2000) return null;
  try {
    const bytes = fromUrlBase64(encoded);
    const ds = new DecompressionStream("deflate-raw");
    const writer = ds.writable.getWriter();
    await writer.write(bytes);
    await writer.close();
    const decompressed = new Uint8Array(await new Response(ds.readable).arrayBuffer());
    const json = new TextDecoder().decode(decompressed);
    const parsed: unknown = JSON.parse(json);
    return validateSharePayload(parsed);
  } catch {
    return null;
  }
}

function validateSharePayload(parsed: unknown): SharePayload | null {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const p = parsed as Record<string, unknown>;

  if (p.v !== 1) return null;

  if (typeof p.task !== "string" || p.task.length < 1 || p.task.length > MAX_TASK_LEN) return null;

  if (!Array.isArray(p.steps) || p.steps.length === 0 || p.steps.length > MAX_STEPS) return null;
  for (const step of p.steps) {
    if (!step || typeof step !== "object" || Array.isArray(step)) return null;
    const s = step as Record<string, unknown>;
    if (typeof s.t !== "string" || s.t.length < 1 || s.t.length > MAX_STEP_T_LEN) return null;
    if (typeof s.m !== "string" || s.m.length < 1 || s.m.length > MAX_STEP_M_LEN) return null;
    if (s.soft !== undefined && typeof s.soft !== "boolean") return null;
    if (containsIllegalContent(s.t)) return null;
  }

  if (typeof p.message !== "string" || p.message.length > MAX_MSG_LEN) return null;
  if (p.message && !validateMessage(p.message).valid) return null;

  if (containsIllegalContent(p.task)) return null;

  return {
    v: 1,
    task: p.task,
    steps: (p.steps as Array<{ t: string; m: string; soft?: boolean }>).map((s) => ({
      t: s.t,
      m: s.m,
      ...(s.soft ? { soft: true } : {}),
    })),
    message: p.message,
  };
}
