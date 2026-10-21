import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/content/info-page";

export const metadata: Metadata = {
  title: "Privacy & POPIA",
  description:
    "How Lovable Store collects, uses and protects your personal information under South Africa's POPIA.",
};

export default function PrivacyPage() {
  return (
    <InfoPage
      eyebrow="Privacy & POPIA"
      title="Your information,"
      accent="handled with care."
      intro="This policy explains what we collect, why we need it and the rights you have under the Protection of Personal Information Act (POPIA)."
      updated="October 2026"
    >
      <h2>Who is responsible</h2>
      <p>
        Lovable Store is the responsible party for personal information
        collected through this store. Our Information Officer can be reached at{" "}
        <a href="mailto:hello@lovablestore.co.za">hello@lovablestore.co.za</a>.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li><strong>Order information:</strong> name, email, mobile number, delivery address and order contents.</li>
        <li><strong>Gift information:</strong> an optional gift note you ask us to write.</li>
        <li><strong>Communication:</strong> messages you send us by email or WhatsApp.</li>
        <li><strong>Newsletter:</strong> your email address if you choose to subscribe.</li>
        <li><strong>Technical data:</strong> basic device and usage information needed to keep the store secure and working.</li>
      </ul>
      <p>
        We do <strong>not</strong> store card details. Payments are processed by
        PayFast, a PCI-DSS compliant payment provider.
      </p>

      <h2>Why we need it</h2>
      <ul>
        <li>To take payment, package and deliver your order.</li>
        <li>To send order confirmations, delivery updates and tracking.</li>
        <li>To handle returns, exchanges and customer support.</li>
        <li>To detect and prevent fraud and abuse.</li>
        <li>To send marketing only where you have opted in or where the law permits.</li>
        <li>To meet tax, accounting and consumer protection obligations.</li>
      </ul>

      <h2>Who we share it with</h2>
      <p>
        We share only what is necessary with operators who help us fulfil your
        order: payment providers, couriers, our e-commerce hosting provider and —
        where a piece ships directly from a supplier — the supplier responsible
        for that item. These operators are required to protect your information
        and use it only for the agreed purpose.
      </p>
      <p>
        Some global suppliers are located outside South Africa. Where personal
        information is transferred across borders, we rely on the supplier&apos;s
        contractual data-protection commitments and transfer only the delivery
        details needed to ship your order.
      </p>
      <p>We never sell your personal information.</p>

      <h2>How long we keep it</h2>
      <p>
        Order records are kept for at least five years to meet tax and accounting
        requirements. Marketing subscriptions are kept until you unsubscribe.
        Messages are kept only as long as needed to resolve your query and keep a
        record of the outcome.
      </p>

      <h2>Cookies and local storage</h2>
      <p>
        The store uses essential cookies for the shopping bag and admin session,
        and local storage to remember your bag on this device. We don&apos;t use
        advertising trackers. Clearing your browser storage removes your saved bag.
      </p>

      <h2>Your rights</h2>
      <p>Under POPIA you may ask us to:</p>
      <ul>
        <li>Confirm what personal information we hold about you and give you a copy.</li>
        <li>Correct information that is inaccurate, irrelevant or out of date.</li>
        <li>Delete information we no longer have a lawful reason to keep.</li>
        <li>Object to processing, including direct marketing.</li>
        <li>Withdraw consent for marketing at any time.</li>
      </ul>
      <p>
        Email our Information Officer to exercise a right. We respond within 30
        days and may ask you to verify your identity to protect your information.
        If you believe we have not resolved a complaint, you may contact the
        Information Regulator of South Africa.
      </p>

      <h2>Security</h2>
      <p>
        We use encryption in transit, access controls, encrypted storage for
        supplier credentials and least-privilege admin access. No online system
        is perfectly secure; if a breach affects you, we will notify you and the
        Information Regulator as required by law.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this policy as the store evolves. The date above shows the
        latest version, and material changes will be communicated to subscribers.
      </p>

      <p>
        Questions? <Link href="/contact">Contact the studio</Link> or read our{" "}
        <Link href="/terms">terms of service</Link>.
      </p>
    </InfoPage>
  );
}
