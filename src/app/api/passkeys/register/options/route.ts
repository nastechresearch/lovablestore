import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { relyingParty, setChallenge } from "@/lib/webauthn";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }
  const ip = await clientIp();
  if (!rateLimit(`passkey-register:${ip}`, 20, 10 * 60_000).ok) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const existing = await prisma.passkey.findMany({ where: { userId: user.id } });
  const rp = relyingParty();

  const options = await generateRegistrationOptions({
    rpName: rp.name,
    rpID: rp.id,
    userID: Buffer.from(user.id),
    userName: user.email,
    userDisplayName: `${user.firstName} ${user.lastName}`,
    attestationType: "none",
    excludeCredentials: existing.map((passkey) => ({
      id: passkey.credentialId,
      transports: passkey.transports
        ? (passkey.transports.split(",") as AuthenticatorTransportFuture[])
        : undefined,
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "required",
      authenticatorAttachment: "platform",
    },
  });

  await setChallenge(options.challenge, "register");
  return NextResponse.json(options);
}

type AuthenticatorTransportFuture =
  | "ble"
  | "cable"
  | "hybrid"
  | "internal"
  | "nfc"
  | "smart-card"
  | "usb";
