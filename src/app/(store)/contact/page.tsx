import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/content/info-page";
import { BRAND, whatsappHref } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to the Lovable Store studio in Johannesburg — email, WhatsApp and order support.",
};

export default function ContactPage() {
  const whatsapp = whatsappHref();

  return (
    <InfoPage
      eyebrow="Contact"
      title="Talk to the"
      accent="studio."
      intro="Order questions, sizing advice, gifting help or a wholesale enquiry — a real person answers within one business day."
    >
      <div className="not-prose grid gap-4 sm:grid-cols-2">
        <a
          href={`mailto:${BRAND.email}`}
          className="group border border-line bg-cream p-6 transition-colors hover:border-champagne"
        >
          <p className="eyebrow text-champagne-dark">Email</p>
          <p className="mt-2 font-display text-2xl group-hover:text-oxblood">{BRAND.email}</p>
          <p className="mt-2 text-[11px] leading-relaxed text-stone">
            Best for order changes, returns and detailed questions. Include your
            order number.
          </p>
        </a>
        {whatsapp ? (
          <a
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
            className="group border border-line bg-cream p-6 transition-colors hover:border-champagne"
          >
            <p className="eyebrow text-champagne-dark">WhatsApp</p>
            <p className="mt-2 font-display text-2xl group-hover:text-oxblood">Message the studio</p>
            <p className="mt-2 text-[11px] leading-relaxed text-stone">
              Fastest for gift emergencies, delivery updates and stock checks.
            </p>
          </a>
        ) : (
          <div className="border border-line bg-cream p-6">
            <p className="eyebrow text-champagne-dark">WhatsApp</p>
            <p className="mt-2 font-display text-2xl">Set up in minutes</p>
            <p className="mt-2 text-[11px] leading-relaxed text-stone">
              Add your WhatsApp number in the store settings to enable chat.
            </p>
          </div>
        )}
      </div>

      <h2>Studio hours</h2>
      <p>
        Monday to Friday, 09:00–17:00 SAST. Weekend messages are answered on the
        next business day. Orders placed after 14:00 dispatch the following
        business day.
      </p>

      <h2>Where we are</h2>
      <p>
        {BRAND.city}. We&apos;re an online-first atelier and don&apos;t have a
        walk-in showroom — but collection can be arranged by appointment for
        local orders.
      </p>

      <h2>Already ordered?</h2>
      <p>
        Track your parcel or view full order details with your order number and
        email. Most questions are answered there instantly.
      </p>
      <p className="not-prose flex flex-wrap gap-3">
        <Link href="/track" className="btn-primary">Track an order</Link>
        <Link href="/delivery-and-returns" className="btn-outline">Delivery &amp; returns</Link>
      </p>

      <h2>Quick answers</h2>
      <div className="not-prose divide-y divide-line border-y border-line">
        {[
          {
            q: "Can I add a gift note?",
            a: "Yes — add it at checkout and we'll handwrite it on a card. Prices are never included on the packing slip.",
          },
          {
            q: "Can I change my delivery address after ordering?",
            a: "If your order hasn't dispatched, email us immediately with the order number. Once scanned by the courier, changes depend on the courier.",
          },
          {
            q: "Do you ship outside South Africa?",
            a: "Not yet. We deliver nationwide and are working on cross-border gifting.",
          },
          {
            q: "Do you offer corporate gifting?",
            a: "Yes — email us with quantities, budget and timing and we'll build a proposal.",
          },
        ].map((item) => (
          <details key={item.q} className="group py-4">
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-[12px] font-medium text-ink marker:content-none">
              {item.q}
              <span className="text-champagne transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-stone">{item.a}</p>
          </details>
        ))}
      </div>
    </InfoPage>
  );
}
