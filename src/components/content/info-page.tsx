import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";

const LINKS = [
  { label: "Delivery & returns", href: "/delivery-and-returns" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy & POPIA", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Track an order", href: "/track" },
];

export function InfoPage({
  eyebrow,
  title,
  accent,
  intro,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  intro: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="border-b border-line bg-cream">
        <div className="container-lux py-12 sm:py-16">
          <nav className="text-[9px] uppercase tracking-[0.16em] text-stone" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-oxblood">Home</Link>
            <span className="mx-2 text-champagne">/</span>
            <span className="text-ink">{eyebrow}</span>
          </nav>
          <Reveal className="mt-7 max-w-3xl">
            <p className="eyebrow text-champagne-dark">{eyebrow}</p>
            <h1 className="mt-4 font-display text-[clamp(2.8rem,6.5vw,5.2rem)] leading-[0.94]">
              {title}
              {accent ? (
                <>
                  {" "}
                  <span className="italic text-oxblood">{accent}</span>
                </>
              ) : null}
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-stone">{intro}</p>
            {updated ? (
              <p className="mt-5 text-[10px] uppercase tracking-[0.14em] text-stone">
                Last updated {updated}
              </p>
            ) : null}
          </Reveal>
        </div>
      </section>

      <div className="container-lux py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[0.3fr_1fr] lg:gap-16">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="eyebrow text-stone">Help &amp; information</p>
            <nav className="mt-4 grid gap-2">
              {LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center justify-between border-b border-line py-2.5 text-[11px] uppercase tracking-[0.12em] text-ink-soft transition-colors hover:text-oxblood"
                >
                  {link.label}
                  <span className="text-champagne transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              ))}
            </nav>
            <div className="mt-6 border border-line bg-cream p-4 text-[11px] leading-relaxed text-stone">
              <p className="font-medium uppercase tracking-[0.12em] text-ink-soft">Need a person?</p>
              <p className="mt-1.5">
                The studio answers within one business day — or WhatsApp us for
                something urgent.
              </p>
            </div>
          </aside>

          <article className="max-w-3xl space-y-8 text-[13px] leading-relaxed text-ink-soft [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-ink [&_h2]:mt-2 [&_h3]:font-display [&_h3]:text-xl [&_h3]:text-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 [&_a]:text-oxblood [&_a]:underline [&_a]:underline-offset-2">
            {children}
          </article>
        </div>
      </div>
    </>
  );
}
