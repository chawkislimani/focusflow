export const ILLEGAL_PATTERNS = [
  /\bdrogue[s]?\b/i,
  /\bcocaine\b/i,
  /\bheroine\b|\bhero[iï]ne\b/i,
  /\btrafic\s+(?:de\s+)?(?:drogue|arme|humain)/i,
  /\barme[s]?\s+(?:à\s+feu|illégale|de\s+guerre)\b/i,
  /\bexplosif[s]?\b/i,
  /\bbombe[s]?\b/i,
  /\battentat[s]?\b/i,
  /\bp[eé]dophili[e]?\b/i,
  /\bviol(?!ation|ent|emment|ence|er\s+une\s+règle)\b/i,
  /\bmeurtre[s]?\b/i,
  /\bassassin(?:at)?\b/i,
  /\bsuicide\s+(?:de\s+quelqu|comment|méthode)/i,
  /\bautomutilation\b/i,
];

const HARASSMENT_PATTERNS = [
  /\btu\s+(?:vas\s+)?(?:crever|mourir|regretter)\b/i,
  /\bje\s+(?:vais\s+)?(?:te\s+)?(?:tuer|massacrer|détruire)\b/i,
  /\bferme\s+(?:ta\s+)?(?:gueule)\b/i,
  /\bva\s+(?:te\s+)?(?:faire\s+)?(?:foutre|tuer)\b/i,
  /\bcons?\b|\bsalop(?:e|ard)?\b|\bpute\b|\bpétasse\b|\bencul(?:é|er)\b/i,
];

const INJECTION_PATTERNS = [
  /ignore\s+(les?\s+)?(instructions?|règles?|prompts?|consignes?)/i,
  /oublie\s+(les?\s+)?(instructions?|règles?|prompts?|consignes?|tout)/i,
  /system\s*prompt/i,
  /jailbreak/i,
  /\bDAN\b/,
  /pretend\s+(to\s+be|you\s+are)/i,
  /bypass\s+(safety|filter|restriction|rule)/i,
];

export function validateMessage(text: string): { valid: boolean; error?: string } {
  if (text.length > 150) {
    return { valid: false, error: "Maximum 150 caractères." };
  }
  if (ILLEGAL_PATTERNS.some((p) => p.test(text))) {
    return { valid: false, error: "Ce message ne peut pas être envoyé." };
  }
  if (HARASSMENT_PATTERNS.some((p) => p.test(text))) {
    return { valid: false, error: "Ce message ne peut pas être envoyé." };
  }
  if (INJECTION_PATTERNS.some((p) => p.test(text))) {
    return { valid: false, error: "Ce message ne peut pas être envoyé." };
  }
  return { valid: true };
}

export function containsIllegalContent(text: string): boolean {
  return ILLEGAL_PATTERNS.some((p) => p.test(text));
}
