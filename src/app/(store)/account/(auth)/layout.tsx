import Link from "next/link";
import Image from "next/image";
import { AccountPerks } from "@/components/account/auth-forms";

export default function AccountAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container-lux py-10 sm:py-14">
      <div className="grid overflow-hidden border border-line bg-cream lg:grid-cols-[1.05fr_1fr]">
        <div className="night-panel relative hidden min-h-[620px] overflow-hidden bg-black lg:block">
          <Image
            src="/images/editorial/hero-gifts.jpg"
            alt="A Black couple exchanging a wrapped gift"
            fill
            sizes="(min-width: 1024px) 50vw, 0px"
            className="object-cover opacity-85"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-9 text-ivory">
            <p className="eyebrow text-champagne">The house account</p>
            <p className="mt-3 max-w-sm font-display text-[2.1rem] leading-[1.12]">
              Keep every gift, order and saved piece in one quiet place.
            </p>
            <div className="mt-6 max-w-xs text-ivory/75">
              <AccountPerks />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
          <Link
            href="/"
            className="mb-8 inline-flex items-baseline gap-1 font-display text-xl text-ink"
          >
            Lovable Store
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
