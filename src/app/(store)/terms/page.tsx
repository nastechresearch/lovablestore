import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/content/info-page";

export const metadata: Metadata = {
  title: "Terms of service",
  description:
    "The terms that apply when you shop with Lovable Store, including pricing, payment, delivery, returns and liability.",
};

export default function TermsPage() {
  return (
    <InfoPage
      eyebrow="Terms"
      title="The fine"
      accent="print."
      intro="These terms apply when you browse or order from Lovable Store. By placing an order, you agree to them."
      updated="October 2026"
    >
      <h2>About us</h2>
      <p>
        Lovable Store is a South African online gifting atelier operating from
        Johannesburg and delivering nationwide. Contact details are on our{" "}
        <Link href="/contact">contact page</Link>.
      </p>

      <h2>Orders</h2>
      <p>
        An order is an offer to buy. We confirm the contract when we send your
        order confirmation and receive successful payment. We may decline or
        cancel an order where a piece is unavailable, a price was listed in error,
        or we suspect fraud — you will receive a full refund of any amount paid.
      </p>
      <p>
        Product images are styled for context; slight variation in colour,
        texture or packaging may occur, especially for handmade or naturally
        finished pieces.
      </p>

      <h2>Pricing</h2>
      <p>
        All prices are in South African Rand and include VAT where applicable.
        Delivery is calculated at checkout. We try to display accurate prices and
        availability but may correct obvious errors before dispatch, with your
        agreement or a full refund.
      </p>

      <h2>Payment</h2>
      <p>
        Payment is processed securely by PayFast. We do not store card details.
        In demo or test environments, orders may be marked paid without real
        payment; those orders are clearly labelled and create no obligation.
      </p>

      <h2>Delivery</h2>
      <p>
        Delivery estimates are not guarantees and may be affected by courier
        delays, customs, weather or public holidays. Risk passes to you on
        delivery to the address you supplied. Please ensure the address and
        contact details are accurate. See{" "}
        <Link href="/delivery-and-returns">delivery &amp; returns</Link>.
      </p>

      <h2>Returns and cancellations</h2>
      <p>
        Board-notice cancellations: you may cancel an online order within five
        business days of receiving the goods, provided the items are unused and in
        original packaging. Our voluntary returns window is 30 days on eligible
        pieces. Personalised, final-sale and opened fragrance products are
        excluded unless defective. This does not limit any rights you have under
        the Consumer Protection Act.
      </p>

      <h2>Promotional codes</h2>
      <p>
        Codes are subject to the conditions shown on the offer, cannot be combined
        and may be withdrawn at any time. One code per order. Codes have no cash
        value and are void where prohibited.
      </p>

      <h2>Intellectual property</h2>
      <p>
        The Lovable Store name, logo, photography, copy and site design are
        owned by us or our licensors and may not be copied or used commercially
        without written permission.
      </p>

      <h2>Acceptable use</h2>
      <p>
        You may not use the store to commit fraud, interfere with security
        features, scrape content at scale or infringe the rights of others. We may
        suspend access for abuse.
      </p>

      <h2>Liability</h2>
      <p>
        To the extent permitted by law, we are not liable for indirect or
        consequential loss arising from use of the store. Nothing in these terms
        excludes liability for gross negligence, wilful misconduct, or any
        liability that may not lawfully be excluded under South African law.
      </p>

      <h2>Governing law</h2>
      <p>
        These terms are governed by the laws of the Republic of South Africa. The
        Consumer Protection Act, Electronic Communications and Transactions Act
        and POPIA apply where relevant. Disputes will first be referred to our
        support team for good-faith resolution.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms from time to time. The version in force when you
        place an order governs that order.
      </p>

      <p>
        Questions about an order? <Link href="/contact">Contact the studio</Link>.
        Read our <Link href="/privacy">privacy &amp; POPIA policy</Link>.
      </p>
    </InfoPage>
  );
}
