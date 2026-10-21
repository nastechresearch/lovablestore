export type CollectionDef = {
  slug: string;
  eyebrow: string;
  title: string;
  accent?: string;
  description: string;
  note: string;
  image: string;
  query: {
    category?: string;
    recipient?: string;
    tag?: string;
    maxPrice?: number;
    source?: "local" | "global";
    sort?: string;
  };
};

export const COLLECTIONS: Record<string, CollectionDef> = {
  "for-her": {
    slug: "for-her",
    eyebrow: "For her",
    title: "Pieces that feel",
    accent: "like her.",
    description:
      "Soft tailoring, a signature scent and small luxuries she will reach for long after the ribbon comes off.",
    note: "The soft edit · local and global",
    image: "/images/editorial/hero-woman.jpg",
    query: { recipient: "For Her" },
  },
  "for-him": {
    slug: "for-him",
    eyebrow: "For him",
    title: "Things he will",
    accent: "actually use.",
    description:
      "Watches, leather, fragrance and relaxed tailoring. Gifts with a reason to stay in the rotation.",
    note: "The considered edit",
    image: "/images/editorial/editorial-men.jpg",
    query: { recipient: "For Him" },
  },
  couples: {
    slug: "couples",
    eyebrow: "For couples",
    title: "Better when it's",
    accent: "shared.",
    description:
      "His-and-hers sets, matching keepsakes and gifts for the two of you — or for the couple you love.",
    note: "The together edit",
    image: "/images/editorial/editorial-couple.jpg",
    query: { tag: "couples" },
  },
  gifts: {
    slug: "gifts",
    eyebrow: "The gift edit",
    title: "Ready to give,",
    accent: "worth keeping.",
    description:
      "Wrapped by hand with a handwritten note. Every piece in this edit is chosen to arrive gift-ready.",
    note: "Gift wrap included",
    image: "/images/editorial/hero-gifts.jpg",
    query: { category: "Gifts" },
  },
  valentines: {
    slug: "valentines",
    eyebrow: "14 February 2027",
    title: "For the one",
    accent: "you'd choose again.",
    description:
      "The love edit: signature scents, keepsakes and gifts for the people who make ordinary days better.",
    note: "The love edit",
    image: "/images/products/love-letter-box.jpg",
    query: { tag: "valentines" },
  },
  bestsellers: {
    slug: "bestsellers",
    eyebrow: "Most gifted",
    title: "The ones that",
    accent: "keep leaving.",
    description:
      "Our most-reordered pieces, ranked by the gifts that get sent again and again.",
    note: "Studio favourites",
    image: "/images/editorial/editorial-fashion.jpg",
    query: { tag: "bestseller", sort: "rating" },
  },
  "under-500": {
    slug: "under-500",
    eyebrow: "Little luxuries",
    title: "Under",
    accent: "R500.",
    description:
      "Small, considered gifts that still feel like an occasion. Wrapped and ready, for under five hundred rand.",
    note: "Gifting, minus the pressure",
    image: "/images/products/love-letter-box.jpg",
    query: { maxPrice: 50000 },
  },
  "under-1000": {
    slug: "under-1000",
    eyebrow: "The sweet spot",
    title: "Under",
    accent: "R1000.",
    description:
      "The easiest price bracket to gift well in: watches, fragrance and keepsakes under a thousand rand.",
    note: "Most-gifted price",
    image: "/images/editorial/hero-gifts.jpg",
    query: { maxPrice: 100000 },
  },
  new: {
    slug: "new",
    eyebrow: "Just arrived",
    title: "New in the",
    accent: "studio.",
    description:
      "Fresh finds, newly sourced pieces and the latest from our local and global partners.",
    note: "Recently added",
    image: "/images/products/signature-gift-tote.jpg",
    query: { tag: "new", sort: "newest" },
  },
  local: {
    slug: "local",
    eyebrow: "Local first",
    title: "Made and held",
    accent: "close.",
    description:
      "Sourced from studios and partners across South Africa. Most local orders arrive in 2–5 days.",
    note: "2–5 day delivery",
    image: "/images/editorial/editorial-fashion.jpg",
    query: { source: "local" },
  },
  global: {
    slug: "global",
    eyebrow: "Global finds",
    title: "Worth the",
    accent: "wait.",
    description:
      "A small edit sourced direct from vetted partners. Every piece shows its true lead time before checkout.",
    note: "12–20 day delivery",
    image: "/images/products/discovery-set.jpg",
    query: { source: "global" },
  },
  watches: {
    slug: "watches",
    eyebrow: "Watches",
    title: "Time, on",
    accent: "your terms.",
    description:
      "Quiet everyday classics and modern chronographs, sourced from our Cape Town watch partner.",
    note: "Two-year movement warranty",
    image: "/images/products/meridian-classic-watch.jpg",
    query: { category: "Watches" },
  },
  fragrance: {
    slug: "fragrance",
    eyebrow: "Fragrance",
    title: "A signature,",
    accent: "bottled.",
    description:
      "Locally blended scents and a couple of rare global finds, chosen for depth rather than volume.",
    note: "Try-before-you-commit sizes",
    image: "/images/products/discovery-set.jpg",
    query: { category: "Fragrance" },
  },
  women: {
    slug: "women",
    eyebrow: "Women",
    title: "Everyday,",
    accent: "elevated.",
    description:
      "Considered pieces for work, weekends and the occasions that deserve a little more.",
    note: "The wardrobe edit",
    image: "/images/editorial/editorial-fashion.jpg",
    query: { category: "Women" },
  },
  men: {
    slug: "men",
    eyebrow: "Men",
    title: "Relaxed",
    accent: "tailoring.",
    description:
      "Linen, merino and leather staples built for long days and repeat wear.",
    note: "The menswear edit",
    image: "/images/editorial/editorial-suit.jpg",
    query: { category: "Men" },
  },
  shoes: {
    slug: "shoes",
    eyebrow: "Shoes",
    title: "Built for",
    accent: "the long day.",
    description:
      "Leather staples from our Durban footwear partner — comfortable from the first wear.",
    note: "The footwear edit",
    image: "/images/products/classic-chelsea-boot.jpg",
    query: { category: "Shoes" },
  },
};

export const COLLECTION_LINKS = [
  { label: "For her", href: "/collections/for-her" },
  { label: "For him", href: "/collections/for-him" },
  { label: "For couples", href: "/collections/couples" },
  { label: "Gifts", href: "/collections/gifts" },
  { label: "Under R500", href: "/collections/under-500" },
  { label: "New in", href: "/collections/new" },
  { label: "Local", href: "/collections/local" },
  { label: "Global finds", href: "/collections/global" },
];
