import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/actions/auth";
import { AccountNav } from "@/components/account/account-nav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

export default async function AccountDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/account/login");

  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="container-lux py-10 sm:py-14">
      <div className="flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center border border-oxblood/20 bg-oxblood/5 font-display text-2xl text-oxblood">
            {initials || "BM"}
          </span>
          <div>
            <p className="eyebrow text-champagne-dark">Your account</p>
            <h1 className="mt-1 font-display text-[2rem] leading-none sm:text-[2.4rem]">
              Hello, {user.firstName}.
            </h1>
            <p className="mt-1.5 text-[11px] text-stone">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 border border-line bg-cream px-3 py-2 text-[9px] uppercase tracking-[0.1em] text-stone sm:inline-flex">
            <ShieldCheck className="size-3.5 text-oxblood" aria-hidden />
            {user.emailVerifiedAt ? "Verified account" : "Secure account"}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 border border-line bg-cream px-3.5 py-2 text-[9px] uppercase tracking-[0.12em] text-stone transition-colors hover:border-oxblood hover:text-oxblood"
            >
              <LogOut className="size-3.5" aria-hidden />
              Sign out
            </button>
          </form>
        </div>
      </div>

      <div className="mt-6">
        <AccountNav />
      </div>

      <div className="mt-8">{children}</div>

      <p className="mt-10 border-t border-line pt-5 text-[9.5px] leading-relaxed text-stone">
        Need to change something we hold?{" "}
        <Link href="/contact" className="text-oxblood underline underline-offset-2">
          Contact the studio
        </Link>{" "}
        or email{" "}
        <a href="mailto:hello@lovablestore.co.za" className="text-oxblood underline underline-offset-2">
          hello@lovablestore.co.za
        </a>
        . Your data is handled under POPIA.
      </p>
    </div>
  );
}
