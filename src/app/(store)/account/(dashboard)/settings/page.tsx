import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Download, LockKeyhole } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { AccountSettingsForm } from "@/components/account/settings-form";

export const metadata: Metadata = {
  title: "Account settings",
  robots: { index: false, follow: false },
};

export default async function AccountSettingsPage() {
  const user = await requireUser("/account/settings");

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow text-champagne-dark">Your preferences</p>
        <h1 className="mt-2 font-display text-[clamp(2.2rem,4vw,3.4rem)] leading-[0.98]">
          Settings
        </h1>
        <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-stone">
          Your public account ID, delivery defaults and the messages you want
          from the market. Order and security emails are always sent.
        </p>
      </div>

      <AccountSettingsForm
        firstName={user.firstName}
        lastName={user.lastName}
        email={user.email}
        phone={user.phone ?? ""}
        accountId={user.accountId ?? "LS-PENDING"}
        defaultAddress={user.defaultAddress ?? ""}
        defaultCity={user.defaultCity ?? ""}
        defaultProvince={user.defaultProvince ?? ""}
        defaultPostalCode={user.defaultPostalCode ?? ""}
        marketingEmail={user.marketingEmail}
        marketingWhatsapp={user.marketingWhatsapp}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="border border-line bg-cream p-5">
          <h2 className="flex items-center gap-2 font-display text-xl">
            <Download className="size-4 text-champagne-dark" aria-hidden />
            Your data
          </h2>
          <p className="mt-2 text-[11px] leading-relaxed text-stone">
            Download a POPIA data export with your profile, orders, wishlist and
            review history.
          </p>
          <a href="/api/account/export" className="btn-outline mt-4 min-h-10 px-4 text-[9px]">
            Download my data
            <ArrowRight className="size-3.5" aria-hidden />
          </a>
        </div>
        <div className="border border-line bg-cream p-5">
          <h2 className="flex items-center gap-2 font-display text-xl">
            <LockKeyhole className="size-4 text-champagne-dark" aria-hidden />
            Security
          </h2>
          <p className="mt-2 text-[11px] leading-relaxed text-stone">
            Change your password, add a passkey for Face ID or fingerprint sign-in,
            and review signed-in devices.
          </p>
          <Link href="/account/security" className="btn-outline mt-4 min-h-10 px-4 text-[9px]">
            Manage security
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
