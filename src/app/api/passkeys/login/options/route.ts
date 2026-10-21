import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { relyingParty, setChallenge } from "@/lib/webauthn";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const ip = await clientIp();
  if (!rateLimit(`passkey-login:${ip}`, 15, 10 * 60_000).ok) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const rp = relyingParty();
  const options = await generateAuthenticationOptions({
    rpID: rp.id,
    userVerification: "required",
    allowCredentials: [],
  });

  await setChallenge(options.challenge, "login");
  return NextResponse.json(options);
}
