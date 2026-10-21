import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "bm_webauthn";

function secret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.ADMIN_COOKIE_SECRET ||
    "blacks-market-dev-secret"
  );
}

export function relyingParty() {
  return {
    id: process.env.WEBAUTHN_RP_ID || "localhost",
    name: process.env.WEBAUTHN_RP_NAME || "Lovable Store",
    origin:
      process.env.WEBAUTHN_ORIGIN ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3100",
  };
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

type ChallengePayload = {
  challenge: string;
  kind: "register" | "login";
  exp: number;
};

export async function setChallenge(
  challenge: string,
  kind: ChallengePayload["kind"],
): Promise<void> {
  const payload: ChallengePayload = {
    challenge,
    kind,
    exp: Date.now() + 5 * 60_000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const store = await cookies();
  store.set(COOKIE, `${encoded}.${sign(encoded)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 300,
  });
}

export async function takeChallenge(
  kind: ChallengePayload["kind"],
): Promise<string | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  const [encoded, signature] = raw.split(".");
  if (!encoded || !signature) return null;
  const expected = sign(encoded);
  if (
    signature.length !== expected.length ||
    !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  ) {
    return null;
  }

  store.delete(COOKIE);
  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as ChallengePayload;
    if (parsed.kind !== kind || parsed.exp < Date.now()) return null;
    return parsed.challenge;
  } catch {
    return null;
  }
}
