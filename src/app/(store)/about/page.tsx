import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { InfoPage } from "@/components/content/info-page";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "Lovable Store is a Johannesburg gifting atelier merging local makers with a vetted global supplier network.",
};

export default function AboutPage() {
  return (
    <>
      <InfoPage
        eyebrow="Our story"
        title="Made for the"
        accent="moment."
        intro="Lovable Store began with a simple frustration: gifting in South Africa was either thoughtless or overpriced. We built an atelier that takes both seriously."
      >
        <h2>Why we exist</h2>
        <p>
          We believe a gift should feel like the person receiving it — specific,
          considered and a little bit special. That means pieces that last beyond
          the occasion, wrapped in a way that makes the unwrapping part of the
          memory.
        </p>
        <p>
          Our store curates watches, fragrance, women&apos;s and men&apos;s
          fashion, shoes and ready-to-give gifts for the moments South Africans
          actually mark: anniversaries, birthdays, Valentine&apos;s, weddings and
          the ordinary Tuesdays that deserve something better.
        </p>

        <h2>Two sources, one standard</h2>
        <p>
          We work with two kinds of partners. Local South African makers and
          suppliers are chosen for craft, consistency and the ability to deliver
          quickly. Our global atelier network — vetted suppliers in China through
          platforms like CJ Dropshipping and AliExpress — gives us access to
          pieces we can&apos;t source locally.
        </p>
        <p>
          Every partner is held to the same checklist: product accuracy, material
          quality, packaging integrity and a real person accountable for
          fulfilment. We&apos;re transparent about where each piece ships from,
          and we show the estimated delivery window on every product page.
        </p>

        <div className="not-prose grid gap-4 py-2 sm:grid-cols-3">
          {[
            { value: "35+", label: "Curated pieces" },
            { value: "2–5", label: "Days, local delivery" },
            { value: "30", label: "Day returns" },
          ].map((stat) => (
            <div key={stat.label} className="border border-line bg-cream p-5">
              <p className="font-display text-4xl text-oxblood">{stat.value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-stone">{stat.label}</p>
            </div>
          ))}
        </div>

        <h2>How ordering works</h2>
        <ul>
          <li>Choose a piece and tell us the size or scent preference.</li>
          <li>We confirm availability and dispatch from the right partner.</li>
          <li>
            Local orders leave Johannesburg within 1–2 business days; global
            pieces are tracked across the journey.
          </li>
          <li>Every order is inspected, wrapped and sent with a handwritten note if you add one.</li>
        </ul>

        <h2>Our promise</h2>
        <p>
          If something isn&apos;t right, tell us. We&apos;ll replace, repair or
          refund within 30 days on eligible pieces — and we&apos;ll always answer
          as a person, not a ticket number.
        </p>
        <p>
          <Link href="/contact">Talk to the studio</Link> or{" "}
          <Link href="/shop">browse the current edit</Link>.
        </p>
      </InfoPage>

      <section className="border-t border-line">
        <div className="container-lux grid gap-6 py-12 lg:grid-cols-2">
          <div className="relative aspect-[16/10] overflow-hidden bg-ivory-deep">
            <Image
              src="/images/editorial/editorial-couple.jpg"
              alt="A couple sharing a gifting moment at home"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center border border-line bg-cream p-8 sm:p-12">
            <p className="eyebrow text-champagne-dark">The next chapter</p>
            <h2 className="mt-3 font-display text-4xl leading-[1.02]">
              We&apos;re building the gifting
              <br />
              <span className="italic text-oxblood">standard</span> for South Africa.
            </h2>
            <p className="mt-4 max-w-md text-[13px] leading-relaxed text-stone">
              More local makers, more personalised pieces and a delivery
              experience worth remembering. Come along.
            </p>
            <Link href="/shop" className="btn-primary mt-7 w-fit">
              Shop the edit
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
