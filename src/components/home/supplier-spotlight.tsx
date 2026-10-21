import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  MapPin,
  Plane,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { SectionHeading } from "@/components/home/section-heading";
import { Reveal } from "@/components/motion/reveal";

function ProofPoint({
  icon: Icon,
  title,
  copy,
  dark = false,
}: {
  icon: LucideIcon;
  title: string;
  copy: string;
  dark?: boolean;
}) {
  return (
    <li className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
      <span
        className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border ${
          dark
            ? "border-champagne/30 text-champagne"
            : "border-champagne/50 text-oxblood"
        }`}
      >
        <Icon className="size-3.5" strokeWidth={1.5} aria-hidden />
      </span>
      <div>
        <p
          className={`text-[9.5px] font-medium uppercase tracking-[0.14em] ${
            dark ? "text-ivory" : "text-ink"
          }`}
        >
          {title}
        </p>
        <p
          className={`mt-1 text-[10.5px] leading-relaxed ${
            dark ? "text-ivory/60" : "text-stone"
          }`}
        >
          {copy}
        </p>
      </div>
    </li>
  );
}

export function SupplierSpotlight() {
  return (
    <section className="container-lux py-16 sm:py-20 lg:py-24">
      <SectionHeading
        eyebrow="The sourcing standard"
        title="Two shelves. One standard."
        description="Local stock and global atelier pieces are vetted, wrapped and tracked the same way. What changes is where they ship from — and we label that on every product."
      />

      <div className="mt-9 grid gap-4 lg:mt-12 lg:grid-cols-2 lg:gap-6">
        <Reveal>
          <article className="relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-cream">
            <div
              className="surface-grid pointer-events-none absolute inset-0 opacity-60"
              aria-hidden
            />
            <div className="relative flex flex-1 flex-col p-6 sm:p-8 lg:p-9">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-full border border-champagne/60 text-oxblood">
                    <MapPin className="size-4" strokeWidth={1.5} aria-hidden />
                  </span>
                  <div>
                    <p className="eyebrow text-champagne-dark">Local partners</p>
                    <p className="mt-1.5 text-[9px] uppercase tracking-[0.14em] text-stone">
                      Johannesburg studio stock
                    </p>
                  </div>
                </div>
                <span className="text-[8px] uppercase tracking-[0.16em] text-stone/50">
                  01
                </span>
              </div>

              <h3 className="mt-7 max-w-sm font-display text-[clamp(1.8rem,3vw,2.5rem)] leading-[1.02]">
                Close to home. Quick to arrive.
              </h3>
              <p className="mt-3 max-w-md text-[11.5px] leading-relaxed text-stone">
                Held and wrapped by our Johannesburg team, so your gift leaves
                the studio within a day — not an overseas warehouse.
              </p>

              <ul className="mt-6 flex-1 divide-y divide-line border-t border-line">
                <ProofPoint
                  icon={MapPin}
                  title="Johannesburg studio stock"
                  copy="Most local pieces sit a corridor away from our wrapping desk."
                />
                <ProofPoint
                  icon={Clock3}
                  title="2–5 business days"
                  copy="Packed in one business day; delivered nationwide."
                />
                <ProofPoint
                  icon={ShieldCheck}
                  title="No customs, no extras"
                  copy="No import duty applies. The checkout price is final."
                />
              </ul>

              <div className="mt-7 flex items-center justify-between gap-4 border-t border-line pt-4">
                <span className="text-[8px] uppercase tracking-[0.16em] text-stone">
                  Local dispatch
                </span>
                <Link
                  href="/collections/bestsellers"
                  className="group inline-flex items-center gap-2 border-b border-oxblood/40 pb-1 text-[9px] uppercase tracking-[0.18em] text-oxblood transition-colors hover:border-oxblood"
                >
                  Shop the bestsellers
                  <ArrowRight
                    className="size-3 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </div>
            </div>
          </article>
        </Reveal>

        <Reveal delay={0.08}>
          <article className="night-panel relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] p-6 text-ivory sm:p-8 lg:p-9">
            <span
              className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full border border-champagne/15"
              aria-hidden
            />
            <span
              className="pointer-events-none absolute -bottom-24 -left-12 size-64 rounded-full border border-champagne/10"
              aria-hidden
            />
            <div className="relative flex flex-1 flex-col">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-full border border-champagne/40 text-champagne">
                    <Plane className="size-4" strokeWidth={1.5} aria-hidden />
                  </span>
                  <div>
                    <p className="eyebrow text-champagne">Global atelier</p>
                    <p className="mt-1.5 text-[9px] uppercase tracking-[0.14em] text-ivory/50">
                      Vetted partners abroad
                    </p>
                  </div>
                </div>
                <span className="text-[8px] uppercase tracking-[0.16em] text-ivory/40">
                  02
                </span>
              </div>

              <h3 className="mt-7 max-w-sm font-display text-[clamp(1.8rem,3vw,2.5rem)] leading-[1.02]">
                Worth the wait. Never the guesswork.
              </h3>
              <p className="mt-3 max-w-md text-[11.5px] leading-relaxed text-ivory/60">
                A small edit from partners we have tested. Lead time, duties and
                tracking are settled before you pay — no surprises at the door.
              </p>

              <ul className="mt-6 flex-1 divide-y divide-ivory/12 border-t border-ivory/15">
                <ProofPoint
                  dark
                  icon={Plane}
                  title="Vetted partners"
                  copy="A short list of ateliers we know, not anonymous listings."
                />
                <ProofPoint
                  dark
                  icon={Clock3}
                  title="10–18 business days"
                  copy="The true lead time is shown on every global product."
                />
                <ProofPoint
                  dark
                  icon={ShieldCheck}
                  title="Customs cleared & tracked"
                  copy="Duties handled by us; tracking from dispatch to your door."
                />
              </ul>

              <div className="mt-7 flex items-center justify-between gap-4 border-t border-ivory/15 pt-4">
                <span className="text-[8px] uppercase tracking-[0.16em] text-ivory/50">
                  Global dispatch
                </span>
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-2 border-b border-champagne/40 pb-1 text-[9px] uppercase tracking-[0.18em] text-champagne transition-colors hover:border-champagne"
                >
                  How we source
                  <ArrowRight
                    className="size-3 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </div>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}
