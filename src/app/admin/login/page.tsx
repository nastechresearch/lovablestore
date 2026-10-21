import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Atelier desk login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await isAdminAuthenticated()) redirect("/admin");

  return (
    <div className="grid min-h-screen bg-ivory lg:grid-cols-[1.05fr_0.95fr]">
      <div className="relative hidden overflow-hidden bg-oxblood-deep lg:block">
        <Image
          src="/images/editorial/hero-woman.jpg"
          alt=""
          fill
          priority
          sizes="52vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-oxblood-deep via-oxblood-deep/55 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-10 text-ivory xl:p-14">
          <Link href="/" className="font-display text-3xl">
            Lovable Store
          </Link>
          <div>
            <p className="eyebrow text-champagne">Atelier desk</p>
            <h2 className="mt-4 max-w-md font-display text-[clamp(2.6rem,4vw,4rem)] leading-[0.98]">
              Every order.
              <br />
              Every parcel.
              <br />
              <span className="italic text-champagne">Accounted for.</span>
            </h2>
            <p className="mt-5 max-w-sm text-[12px] leading-relaxed text-ivory/60">
              Products, suppliers, promos, tags and fulfilment in one quiet
              workspace.
            </p>
          </div>
          <p className="text-[9px] uppercase tracking-[0.18em] text-ivory/35">
            Authorised staff only · POPIA-protected data
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          <Link href="/" className="font-display text-3xl lg:hidden">
            Lovable Store
          </Link>
          <p className="mt-10 eyebrow text-champagne-dark lg:mt-0">Store login</p>
          <h1 className="mt-3 font-display text-[2.6rem] leading-[1.02]">
            Welcome back
            <br />
            <span className="italic text-oxblood">to the desk.</span>
          </h1>
          <p className="mt-3 text-[12px] leading-relaxed text-stone">
            Sign in to manage the storefront, supplier connections and orders.
          </p>

          <LoginForm showDemoHint={process.env.ADMIN_PASSWORD === "blacks-market-admin"} />

          <div className="mt-8 flex items-center justify-between border-t border-line pt-5 text-[10px] uppercase tracking-[0.12em] text-stone">
            <Link href="/" className="transition-colors hover:text-oxblood">
              Return to store
            </Link>
            <Link href="/contact" className="transition-colors hover:text-oxblood">
              Need access?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
