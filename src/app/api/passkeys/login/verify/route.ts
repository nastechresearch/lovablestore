import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { createUserSession } from "@/lib/auth";
import { relyingParty, takeChallenge } from "@/lib/webauthn";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = await clientIp();
  if (!rateLimit(`passkey-login-verify:${ip}`, 15, 10 * 60_000).ok) {
    return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });
  }

  const challenge = await takeChallenge("login");
  if (!challenge) {
    return NextResponse.json(
      { error: "This passkey request expired. Try again." },
      { status: 400 },
    );
  }

  let body: { id?: string; rawId?: string } & Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid passkey response." }, { status: 400 });
  }

  const credentialId = body.id ?? body.rawId;
  if (!credentialId) {
    return NextResponse.json({ error: "Missing passkey identifier." }, { status: 400 });
  }

  const passkey = await prisma.passkey.findUnique({
    where: { credentialId },
    include: { user: true },
  });
  if (!passkey) {
    return NextResponse.json({ error: "Passkey not recognised." }, { status: 401 });
  }
  if (passkey.user.lockedUntil && passkey.user.lockedUntil > new Date()) {
    return NextResponse.json(
      { error: "This account is temporarily locked." },
      { status: 423 },
    );
  }

  const rp = relyingParty();
  try {
    const result = await verifyAuthenticationResponse({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response: body as any,
      expectedChallenge: challenge,
      expectedOrigin: rp.origin,
      expectedRPID: rp.id,
      credential: {
        id: passkey.credentialId,
        publicKey: new Uint8Array(passkey.publicKey),
        counter: Number(passkey.counter),
        transports: passkey.transports
          ? (passkey.transports.split(",") as AuthenticatorTransportFuture[])
          : undefined,
      },
      requireUserVerification: true,
    });

    if (!result.verified) {
      return NextResponse.json({ error: "Passkey could not be verified." }, { status: 401 });
    }

    await prisma.$transaction([
      prisma.passkey.update({
        where: { id: passkey.id },
        data: {
          counter: BigInt(result.authenticationInfo.newCounter),
          lastUsedAt: new Date(),
        },
      }),
      prisma.user.update({
        where: { id: passkey.userId },
        data: { lastLoginAt: new Date(), failedLoginAttempts: 0, lockedUntil: null },
      }),
    ]);

    const userAgent = request.headers.get("user-agent");
    await createUserSession(passkey.userId, { ip, userAgent });
    return NextResponse.json({ ok: true, redirect: "/account" });
  } catch {
    return NextResponse.json({ error: "Passkey verification failed." }, { status: 400 });
  }
}

type AuthenticatorTransportFuture =
  | "ble"
  | "cable"
  | "hybrid"
  | "internal"
  | "nfc"
  | "smart-card"
  | "usb";
