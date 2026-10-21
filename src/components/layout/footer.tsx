import Link from "next/link";
import { LockKeyhole } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";
import { InstallLink } from "@/components/pwa/install-link";
import { BRAND, whatsappHref } from "@/lib/constants";

const shopLinks = [
  { label: "Shop all", href: "/shop" },
  { label: "Watches", href: "/shop?category=Watches" },
  { label: "Fragrance", href: "/shop?category=Fragrance" },
  { label: "Women", href: "/shop?category=Women" },
  { label: "Men", href: "/shop?category=Men" },
  { label: "Shoes", href: "/shop?category=Shoes" },
  { label: "Gifts", href: "/collections/gifts" },
  { label: "Custom atelier", href: "/studio" },
  { label: "Lookbook", href: "/lookbook" },
];

const helpLinks = [
  { label: "Gift finder", href: "/gift-finder" },
  { label: "Mzansi moments", href: "/moments" },
  { label: "Offers & codes", href: "/promos" },
  { label: "Guides & tutorials", href: "/guides" },
  { label: "Tools", href: "/tools" },
  { label: "Delivery & returns", href: "/delivery-and-returns" },
  { label: "Contact us", href: "/contact" },
  { label: "Search", href: "/search" },
  { label: "Track an order", href: "/track" },
];

const companyLinks = [
  { label: "Our story", href: "/about" },
  { label: "My account", href: "/account" },
  { label: "Privacy & POPIA", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Store login", href: "/admin/login" },
];

export function Footer() {
  const whatsapp = whatsappHref();

  return (
    <footer className="night-panel text-ivory">
      <div className="container-lux">
        <div className="grid gap-10 border-b border-ivory/12 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:py-20">
          <div>
            <p className="eyebrow text-champagne">Stay close</p>
            <h2 className="mt-3 max-w-[14ch] font-display text-[2.25rem] leading-[0.95] sm:text-5xl">
              First looks,
              <br />
              thoughtful gifts.
            </h2>
            <p className="mt-5 max-w-[42ch] text-sm leading-relaxed text-ivory/65">
              New arrivals, considered gift edits and the occasional early
              access. Straight to your inbox.
            </p>
          </div>
          <div className="flex items-center">
            <NewsletterForm tone="dark" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:py-16">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="font-display text-4xl">
              Lovable Store
            </Link>
            <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-champagne/80">
              {BRAND.tagline}
            </p>
            <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-ivory/60">
              Considered gifts and everyday pieces for him, her and couples.
              Wrapped with care in Johannesburg and delivered nationwide.
            </p>
            <p className="mt-5 text-[11px] uppercase tracking-[0.16em] text-ivory/45">
              {BRAND.city}
            </p>
            <div className="mt-6 space-y-2 text-sm text-ivory/65">
              <a href={`mailto:${BRAND.email}`} className="block hover:text-ivory">
                {BRAND.email}
              </a>
              {whatsapp ? (
                <a
                  href={whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="block hover:text-ivory"
                >
                  Chat on WhatsApp
                </a>
              ) : null}
              <InstallLink className="block text-left hover:text-ivory">
                Get the app
              </InstallLink>
            </div>
          </div>

          <FooterColumn title="Shop" links={shopLinks} />
          <FooterColumn title="Help" links={helpLinks} />
          <FooterColumn title="Company" links={companyLinks} />
        </div>

        <div className="flex flex-col gap-4 border-t border-ivory/12 py-6 text-[11px] text-ivory/45 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} Lovable Store. Prices in ZAR. All
            rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center gap-1.5">
              <LockKeyhole className="size-3.5" aria-hidden />
              Secure checkout
            </span>
            <span>PayFast · Visa · Mastercard · Instant EFT</span>
          </div>
        </div>
      </div>

      <div aria-hidden className="overflow-hidden border-t border-ivory/8">
        <p className="container-lux select-none whitespace-nowrap py-4 font-display text-[14vw] leading-[0.7] text-ivory/[0.035] sm:text-[18vw]">
          Lovable Store
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="eyebrow text-ivory/40">{title}</p>
      <ul className="mt-5 space-y-3 text-sm text-ivory/65">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="transition-colors hover:text-ivory">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
