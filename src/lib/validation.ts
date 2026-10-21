import "server-only";
import { resolve4, resolveMx } from "node:dns/promises";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

const DISPOSABLE = new Set([
  "10minutemail.com",
  "10minutemail.net",
  "20minutemail.com",
  "anonbox.net",
  "burnermail.io",
  "discard.email",
  "dispostable.com",
  "emailondeck.com",
  "fakeinbox.com",
  "getairmail.com",
  "getnada.com",
  "guerrillamail.com",
  "guerrillamail.net",
  "guerrillamail.org",
  "harakirimail.com",
  "inboxkitten.com",
  "jetable.org",
  "mailcatch.com",
  "maildrop.cc",
  "mailinator.com",
  "mailnesia.com",
  "mailnull.com",
  "mintemail.com",
  "mohmal.com",
  "mytemp.email",
  "sharklasers.com",
  "spam4.me",
  "spamgourmet.com",
  "tempail.com",
  "temp-mail.io",
  "temp-mail.org",
  "tempmail.com",
  "tempmail.net",
  "tempmailo.com",
  "throwawaymail.com",
  "trashmail.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
]);

const SUSPICIOUS_DOMAIN_PARTS = [
  "tempmail",
  "temp-mail",
  "throwaway",
  "trashmail",
  "mailinator",
  "yopmail",
  "guerrilla",
  "10minute",
  "fakeinbox",
  "disposable",
];

export type EmailCheck = {
  ok: boolean;
  normalized: string;
  message?: string;
};

export async function validateEmail(raw: string): Promise<EmailCheck> {
  const normalized = raw.trim().toLowerCase();
  if (!normalized) {
    return { ok: false, normalized, message: "Enter your email address." };
  }
  if (normalized.length > 254 || !EMAIL_RE.test(normalized)) {
    return { ok: false, normalized, message: "That email address does not look right." };
  }
  const [local, domain] = normalized.split("@");
  if (!local || !domain || local.length > 64) {
    return { ok: false, normalized, message: "That email address does not look right." };
  }
  if (
    DISPOSABLE.has(domain) ||
    SUSPICIOUS_DOMAIN_PARTS.some((part) => domain.includes(part))
  ) {
    return {
      ok: false,
      normalized,
      message: "Please use a permanent email — temporary inboxes are not accepted.",
    };
  }

  const timed = <T>(promise: Promise<T>): Promise<T | null> =>
    Promise.race([
      promise,
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 4000)),
    ]);

  try {
    const mx = await timed(resolveMx(domain));
    if (mx === null) return { ok: true, normalized };
    if (mx.length === 0) {
      const a = await timed(resolve4(domain));
      if (a === null) return { ok: true, normalized };
      if (a.length === 0) {
        return { ok: false, normalized, message: "That email domain cannot receive mail." };
      }
    }
    return { ok: true, normalized };
  } catch {
    return { ok: false, normalized, message: "That email domain cannot receive mail." };
  }
}

export { passwordStrength } from "./password";
export type { PasswordStrength } from "./password";

export function normalizeSaPhone(raw: string): string | null {
  if (!raw.trim()) return null;
  const digits = raw.replace(/[^\d+]/g, "");
  const normalized = digits.startsWith("+27")
    ? `0${digits.slice(3)}`
    : digits.startsWith("27") && digits.length === 11
      ? `0${digits.slice(2)}`
      : digits;
  if (!/^0[6-8]\d{8}$/.test(normalized)) return null;
  if (/^0(\d)\1{8}$/.test(normalized)) return null;
  if (normalized === "0123456789" || normalized === "0876543210") return null;
  return `+27${normalized.slice(1)}`;
}

export function isBusinessHours(now = new Date()): boolean {
  // 09:00–18:00 SAST, Monday to Saturday.
  const sast = new Date(now.toLocaleString("en-US", { timeZone: "Africa/Johannesburg" }));
  const day = sast.getDay();
  const hour = sast.getHours();
  return day >= 1 && day <= 6 && hour >= 9 && hour < 18;
}
