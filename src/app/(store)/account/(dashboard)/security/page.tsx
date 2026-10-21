import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Laptop, Smartphone, ShieldCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, requireUser, SESSION_COOKIE, hashSessionToken } from "@/lib/auth";
import { revokeSessionAction } from "@/actions/auth";
import { formatDate } from "@/lib/format";
import { ChangePasswordForm, PasskeyManager } from "@/components/account/security-forms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Security",
  robots: { index: false, follow: false },
};

function deviceName(userAgent: string | null): string {
  if (!userAgent) return "Unknown device";
  if (/iphone|ipad|ipod/i.test(userAgent)) return "iPhone or iPad";
  if (/android/i.test(userAgent)) return "Android device";
  if (/macintosh|mac os x/i.test(userAgent)) return "Mac";
  if (/windows/i.test(userAgent)) return "Windows PC";
  if (/linux/i.test(userAgent)) return "Linux computer";
  return "Web browser";
}

export default async function AccountSecurityPage() {
  const user = await requireUser("/account/security");
  const current = await getCurrentSession();
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE)?.value;

  const [sessions, passkeys] = await Promise.all([
    prisma.session.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.passkey.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const currentHash = rawToken ? hashSessionToken(rawToken) : current?.tokenHash ?? null;

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow text-champagne-dark">Security centre</p>
        <h1 className="mt-1 font-display text-3xl">Protect your account.</h1>
        <p className="mt-1 max-w-2xl text-[11px] leading-relaxed text-stone">
          Passkeys replace passwords with a biometric check on your device. Session controls let
          you sign out devices you no longer use.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChangePasswordForm />
        <PasskeyManager
          passkeys={passkeys.map((passkey) => ({
            id: passkey.id,
            deviceType: passkey.deviceType ?? "platform",
            backedUp: passkey.backedUp,
            transports: passkey.transports,
            lastUsedAt: passkey.lastUsedAt ? formatDate(passkey.lastUsedAt) : null,
            createdAt: formatDate(passkey.createdAt),
          }))}
        />
      </div>

      <section className="border border-line bg-cream p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl">Active sessions</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-stone">
              Each sign-in creates a separate session. Revoke anything you don&rsquo;t recognise.
            </p>
          </div>
          <span className="hidden items-center gap-1.5 text-[9px] uppercase tracking-[0.1em] text-stone sm:inline-flex">
            <ShieldCheck className="size-3.5 text-oxblood" aria-hidden />
            {sessions.length} active
          </span>
        </div>

        <ul className="mt-4 divide-y divide-line border border-line">
          {sessions.map((session) => {
            const isCurrent = currentHash === session.tokenHash;
            const mobile = /iphone|android|ipad/i.test(session.userAgent ?? "");
            return (
              <li key={session.id} className="flex flex-wrap items-center justify-between gap-3 p-3.5">
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center border border-line bg-ivory-deep/40 text-stone">
                    {mobile ? (
                      <Smartphone className="size-4" aria-hidden />
                    ) : (
                      <Laptop className="size-4" aria-hidden />
                    )}
                  </span>
                  <div>
                    <p className="flex flex-wrap items-center gap-2 text-[11px] font-medium text-ink">
                      {deviceName(session.userAgent)}
                      {isCurrent ? (
                        <span className="border border-oxblood/25 bg-oxblood/5 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.1em] text-oxblood">
                          This device
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-[9.5px] text-stone">
                      Signed in {formatDate(session.createdAt)}
                      {session.ip ? ` · ${session.ip}` : ""} · expires {formatDate(session.expiresAt)}
                    </p>
                  </div>
                </div>
                {isCurrent ? (
                  <span className="text-[9px] uppercase tracking-[0.1em] text-stone">Current</span>
                ) : (
                  <form action={revokeSessionAction.bind(null, session.id)}>
                    <button
                      type="submit"
                      className="border border-line px-2.5 py-1.5 text-[9px] uppercase tracking-[0.1em] text-stone transition-colors hover:border-oxblood hover:text-oxblood"
                    >
                      Revoke
                    </button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="border border-line bg-ivory-deep/30 p-5">
        <h2 className="font-display text-xl">How we protect your account</h2>
        <ul className="mt-3 grid gap-2 text-[10.5px] leading-relaxed text-stone sm:grid-cols-2">
          <li>Passwords are hashed with scrypt — never stored in plain text.</li>
          <li>Sessions are hashed server-side and expire after 30 days.</li>
          <li>Repeated failed sign-ins trigger a temporary account lock.</li>
          <li>Passkey biometrics stay on your device; we store only a public key.</li>
        </ul>
      </section>
    </div>
  );
}
