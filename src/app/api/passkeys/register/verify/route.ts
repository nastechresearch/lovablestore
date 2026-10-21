import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { relyingParty, takeChallenge } from "@/lib/webauthn";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const challenge = await takeChallenge("register");
  if (!challenge) {
    return NextResponse.json(
      { error: "This passkey request expired. Try again." },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid passkey response." }, { status: 400 });
  }

  const rp = relyingParty();
  try {
    const result = await verifyRegistrationResponse({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      response: body as any,
      expectedChallenge: challenge,
      expectedOrigin: rp.origin,
      expectedRPID: rp.id,
      requireUserVerification: true,
    });

    if (!result.verified) {
      return NextResponse.json({ error: "Passkey could not be verified." }, { status: 400 });
    }

    const { credential, credentialDeviceType, credentialBackedUp } = result.registrationInfo;
    const exists = await prisma.passkey.findUnique({
      where: { credentialId: credential.id },
    });
    if (exists) {
      return NextResponse.json({ error: "This passkey is already registered." }, { status: 409 });
    }

    await prisma.passkey.create({
      data: {
        userId: user.id,
        credentialId: credential.id,
        publicKey: Buffer.from(credential.publicKey),
        counter: BigInt(credential.counter),
        transports: (credential.transports ?? []).join(","),
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        lastUsedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Passkey verification failed." }, { status: 400 });
  }
}
