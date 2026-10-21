import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/content/info-page";

export const metadata: Metadata = {
  title: "Delivery & returns",
  description:
    "Delivery times, costs, tracking and returns for Lovable Store orders across South Africa.",
};

export default function DeliveryPage() {
  return (
    <InfoPage
      eyebrow="Delivery & returns"
      title="From our studio"
      accent="to their door."
      intro="Clear timelines, tracked parcels and a returns process that doesn't require a fight. Here's exactly what to expect."
      updated="October 2026"
    >
      <h2>Delivery options</h2>
      <div className="not-prose overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left text-[12px]">
          <thead>
            <tr className="border-b border-line text-[9px] uppercase tracking-[0.14em] text-stone">
              <th className="py-3 pr-4 font-medium">Service</th>
              <th className="py-3 pr-4 font-medium">Estimate</th>
              <th className="py-3 pr-4 font-medium">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            <tr>
              <td className="py-3 pr-4">Standard nationwide (local stock)</td>
              <td className="py-3 pr-4 text-stone">2–5 business days</td>
              <td className="py-3 pr-4">R85 · free over R950</td>
            </tr>
            <tr>
              <td className="py-3 pr-4">Global atelier pieces</td>
              <td className="py-3 pr-4 text-stone">10–18 business days</td>
              <td className="py-3 pr-4">Included in the listed price</td>
            </tr>
            <tr>
              <td className="py-3 pr-4">Gift wrap &amp; handwritten note</td>
              <td className="py-3 pr-4 text-stone">With every order</td>
              <td className="py-3 pr-4">Complimentary</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Each product page shows the dispatch location and delivery window for
        that piece. If your order mixes local and global items, it may arrive in
        more than one parcel — you&apos;ll receive tracking for each.
      </p>

      <h2>Tracking</h2>
      <p>
        You&apos;ll receive an email and SMS with a tracking number once the
        courier scans your parcel. You can also{" "}
        <Link href="/track">track your order</Link> with your order number and
        the email used at checkout.
      </p>

      <h2>Returns</h2>
      <p>
        We accept returns within <strong>30 days</strong> of delivery on eligible
        pieces in original, unworn condition with tags attached. Fragrance must be
        unopened and in its cellophane. Personalised and final-sale pieces are not
        returnable unless faulty.
      </p>
      <ol className="list-decimal space-y-2 pl-5">
        <li>
          Email <a href="mailto:hello@lovablestore.co.za">hello@lovablestore.co.za</a>{" "}
          with your order number and the item you&apos;d like to return.
        </li>
        <li>We&apos;ll confirm eligibility and send a collection or drop-off instruction.</li>
        <li>
          Once the piece is received and inspected, we refund the original payment
          method within 5–10 business days, or offer an exchange.
        </li>
      </ol>
      <p>
        If a piece arrives damaged or incorrect, send a photo within 48 hours and
        we&apos;ll make it right at no cost to you.
      </p>

      <h2>Exchanges</h2>
      <p>
        Need a different size or scent? We&apos;ll reserve the replacement while
        your return is in transit where stock allows. Contact us before sending
        anything back.
      </p>

      <h2>Failed deliveries</h2>
      <p>
        Please ensure someone is available at the delivery address. If a courier
        cannot deliver after two attempts, the parcel returns to us and a
        re-delivery fee may apply. We&apos;ll always contact you first.
      </p>

      <p>
        Questions? <Link href="/contact">Contact the studio</Link> — real people,
        one business day.
      </p>
    </InfoPage>
  );
}
