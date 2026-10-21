import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { RegisterForm } from "@/components/account/auth-forms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create a Lovable Store account for faster checkout, order tracking and saved gifts.",
  robots: { index: false, follow: false },
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/account");

  return (
    <div>
      <p className="eyebrow text-champagne-dark">Join the house</p>
      <h1 className="mt-2 font-display text-4xl leading-tight sm:text-[2.75rem]">
        Create your account.
      </h1>
      <p className="mt-2 text-[12px] leading-relaxed text-stone">
        One account for orders, saved pieces and passkeys. We check every email against
        disposable inboxes and validate South African mobile numbers.
      </p>
      <div className="mt-7">
        <RegisterForm />
      </div>
    </div>
  );
}
