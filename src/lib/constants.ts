export const BRAND = {
  name: "Lovable Store",
  shortName: "LS",
  tagline: "Where magic gift starts from",
  email: process.env.NEXT_PUBLIC_STORE_EMAIL || "hello@lovablestore.co.za",
  city: "Johannesburg, South Africa",
} as const;

export const FREE_SHIPPING_THRESHOLD = 95000;
export const SHIPPING_FEE = 8500;

export const STORE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const PROVINCES = [
  "Eastern Cape",
  "Free State",
  "Gauteng",
  "KwaZulu-Natal",
  "Limpopo",
  "Mpumalanga",
  "Northern Cape",
  "North West",
  "Western Cape",
] as const;

export const CATEGORY_META: Record<
  string,
  { label: string; blurb: string; image: string; href: string }
> = {
  Watches: {
    label: "Watches",
    blurb: "Quiet classics and modern chronographs.",
    image: "/images/products/meridian-classic-watch.jpg",
    href: "/shop?category=Watches",
  },
  Fragrance: {
    label: "Fragrance",
    blurb: "Locally blended scents for every signature.",
    image: "/images/products/discovery-set.jpg",
    href: "/shop?category=Fragrance",
  },
  Women: {
    label: "Women",
    blurb: "Considered pieces for everyday and occasion.",
    image: "/images/editorial/editorial-fashion.jpg",
    href: "/shop?category=Women",
  },
  Men: {
    label: "Men",
    blurb: "Relaxed tailoring, knitwear and leather.",
    image: "/images/editorial/editorial-suit.jpg",
    href: "/shop?category=Men",
  },
  Shoes: {
    label: "Shoes",
    blurb: "Leather staples built for long days.",
    image: "/images/products/classic-chelsea-boot.jpg",
    href: "/shop?category=Shoes",
  },
  Gifts: {
    label: "Gifts",
    blurb: "Wrapped, personalised and ready to give.",
    image: "/images/editorial/hero-gifts.jpg",
    href: "/shop?category=Gifts",
  },
};

export const NAV_LINKS = [
  { label: "Shop all", href: "/shop" },
  { label: "For her", href: "/collections/for-her" },
  { label: "For him", href: "/collections/for-him" },
  { label: "Gifts", href: "/collections/gifts" },
  { label: "Moments", href: "/moments" },
  { label: "Offers", href: "/promos" },
  { label: "Valentine's", href: "/valentines", accent: true },
] as const;

export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS: Record<string, string> = {
  PENDING: "Awaiting payment",
  PAID: "Payment received",
  PACKED: "Packed with care",
  SHIPPED: "On its way",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export function whatsappHref(message = "Hi Lovable Store, I need some help with a gift."): string | null {
  const raw = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");
  if (!raw) return null;
  return `https://wa.me/${raw}?text=${encodeURIComponent(message)}`;
}
