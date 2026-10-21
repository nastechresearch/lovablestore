import type { Metadata } from "next";
import { getCurrentUser, safeNextPath } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/account/auth-forms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Lovable Store account to track orders and saved pieces.",
  robots: { index: false, follow: false },
};

type SearchParams = Promise<{ next?: string }>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/account");

  const params = await searchParams;
  const next = safeNextPath(params.next);

  return (
    <div>
      <p className="eyebrow text-champagne-dark">Welcome back</p>
      <h1 className="mt-2 font-display text-4xl leading-tight sm:text-[2.75rem]">
        Sign in to your account.
      </h1>
      <p className="mt-2 text-[12px] leading-relaxed text-stone">
        Track orders, keep a wishlist and check out faster. Passkey sign-in works with Face ID,
        a fingerprint or Windows Hello.
      </p>
      <div className="mt-7">
        <LoginForm next={next} />
      </div>
      <p className="mt-6 border-t border-line pt-4 text-[9.5px] leading-relaxed text-stone">
        Protected by rate limiting, account lockouts and device passkeys. We will never ask for
        your password by email or WhatsApp.
      </p>
    </div>
  );
}
