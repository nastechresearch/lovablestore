import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Sparkles } from "lucide-react";
import {
  Chapter,
  type ChapterData,
} from "@/components/lookbook/chapter";
import {
  ImageStack,
  type LookImage,
} from "@/components/lookbook/image-stack";

export const metadata: Metadata = {
  title: "The Considered Edit — Volume 01",
  description:
    "A three-chapter lookbook from Lovable Store: summer weddings, year-end gifting and the quiet luxury of everyday pieces. Chosen in Johannesburg, wrapped by hand.",
  openGraph: {
    title: "The Considered Edit — Volume 01",
    description:
      "Summer weddings, the December desk and the quiet everyday. A lookbook from Lovable Store, chosen in Johannesburg.",
    images: [
      {
        url: "/images/editorial/editorial-fashion.jpg",
        width: 1400,
        height: 1000,
        alt: "Portrait of a Black woman in a black one-shoulder dress against a warm brown backdrop",
      },
    ],
  },
};

const HERO_IMAGES: LookImage[] = [
  {
    src: "/images/editorial/editorial-fashion.jpg",
    alt: "Portrait of a Black woman in a black one-shoulder dress",
    position: "center 30%",
  },
  {
    src: "/images/editorial/hero-gifts.jpg",
    alt: "A Black couple exchanging a small wrapped gift beside a piano",
    position: "center 45%",
  },
  {
    src: "/images/editorial/editorial-watch.jpg",
    alt: "A Black woman's hands wearing a watch and gold rings",
    position: "center",
  },
];

const CHAPTERS: ChapterData[] = [
  {
    number: "01",
    name: "The Summer Wedding",
    title: "The summer",
    accent: "wedding.",
    subtitle: "For the couple, and the guest who plans ahead.",
    copy: "Wedding season begins with the jacarandas and runs until the Cape southeaster finally turns. The most memorable guests are rarely the loudest — a deep coat for the drive home, a watch passed down rather than bought for the day, a scent that brings back the speeches years later. Start with one piece worth keeping, then let the rest follow.",
    images: [
      {
        src: "/images/editorial/editorial-bride.jpg",
        alt: "A Black bride in white wedding attire",
        position: "center",
      },
      {
        src: "/images/editorial/editorial-couple.jpg",
        alt: "A couple exchanging a small gift box",
        position: "center",
      },
      {
        src: "/images/editorial/editorial-perfume.jpg",
        alt: "A gold-cased fragrance resting among sprigs of baby's breath",
        position: "center",
      },
    ],
    href: "/collections/couples",
    hrefNote: "The couples edit",
    mood: ["Long-table linen", "Warm metals", "A coat for the drive home"],
  },
  {
    number: "02",
    name: "The December Desk",
    title: "The December",
    accent: "desk.",
    subtitle: "Year-end thank-yous, without the corporate aftertaste.",
    copy: "By mid-November the calendar belongs to everyone else: functions, deadlines, the last courier cut-off before the country slows down. The gift is usually the last thing decided, and it shows. We build the year-end edit around things a person would choose for themselves — a clean watch, a scent that travels, leather that improves with wear — then wrap each one by hand and send it to the desk, the door or home.",
    images: [
      {
        src: "/images/editorial/hero-gifts.jpg",
        alt: "A Black couple exchanging a wrapped gift",
        position: "center 45%",
      },
      {
        src: "/images/editorial/editorial-gift-moment.jpg",
        alt: "A couple opening Christmas gifts at home",
        position: "center",
      },
      {
        src: "/images/editorial/editorial-celebration.jpg",
        alt: "A family gathered around a dinner table",
        position: "center",
      },
    ],
    href: "/collections/gifts",
    hrefNote: "The gift edit",
    mood: ["Kraft paper", "Oxblood ribbon", "A note in your hand"],
    surface: "cream",
    flip: true,
  },
  {
    number: "03",
    name: "The Quiet Everyday",
    title: "The quiet",
    accent: "everyday.",
    subtitle: "No occasion. No ribbon required.",
    copy: "Some of the best gifts never make it to a birthday. They arrive on an ordinary Tuesday and settle into the routine — a low gold watch by the kettle, a scent left on the dresser, a pair of shoes that already know the walk to the corner. Buy fewer, choose better, and let the everyday do the rest.",
    images: [
      {
        src: "/images/editorial/editorial-woman-bw.jpg",
        alt: "Black-and-white portrait of a woman in a light coat",
        position: "center",
      },
      {
        src: "/images/editorial/editorial-knit.jpg",
        alt: "A Black man in a cream open-knit sweater",
        position: "center",
      },
      {
        src: "/images/editorial/editorial-joy.jpg",
        alt: "A smiling Black woman in soft natural light",
        position: "center",
      },
      {
        src: "/images/editorial/hero-woman.jpg",
        alt: "Portrait of a stylish Black woman in an elegant dress",
        position: "center 20%",
      },
    ],
    href: "/shop?category=Watches",
    hrefNote: "Watches, quietly",
    mood: ["Tuesday light", "A quiet dial", "Scent on the dresser"],
    surface: "deep",
  },
];

export default function LookbookPage() {
  return (
    <div>
      <section className="relative overflow-hidden bg-cream">
        <div className="pointer-events-none absolute -right-32 top-24 size-[30rem] rounded-full bg-blush/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 bottom-10 size-[22rem] rounded-full bg-champagne/10 blur-3xl" />

        <div className="container-lux relative flex items-center justify-between gap-4 border-b border-line py-4">
          <p className="text-[9px] uppercase tracking-[0.2em] text-ink-soft">
            Lovable Store
            <span aria-hidden className="mx-2 text-champagne">
              /
            </span>
            The Lookbook
          </p>
          <p className="text-[9px] uppercase tracking-[0.2em] text-stone">
            <span className="sm:hidden">Vol. 01</span>
            <span className="hidden sm:inline">Volume 01 · Summer 2026/27</span>
          </p>
        </div>

        <div className="container-lux relative grid gap-14 pb-16 pt-10 sm:pb-20 lg:grid-cols-12 lg:items-center lg:gap-8 lg:pb-24 lg:pt-16">
          <div className="relative z-10 lg:col-span-5">
            <p className="flex items-center gap-3">
              <span aria-hidden className="h-px w-9 bg-champagne-dark" />
              <span className="eyebrow text-champagne-dark">
                The Lookbook · Volume 01
              </span>
            </p>

            <h1 className="mt-6 font-display text-[clamp(3.1rem,7vw,5.9rem)] leading-[0.92] tracking-[-0.02em]">
              <span className="block">The Considered</span>
              <span className="block italic text-oxblood">Edit.</span>
            </h1>

            <p className="mt-6 max-w-md text-[0.95rem] leading-[1.8] text-ink-soft">
              A three-chapter study in giving well in South Africa: the summer
              wedding, the year-end desk, and the quiet luxury of an ordinary
              Tuesday. Chosen in Johannesburg, wrapped by hand, sent anywhere in
              the country.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="#chapter-01" className="btn-primary group">
                Read the chapters
                <ArrowDown
                  className="size-3.5 transition-transform duration-500 group-hover:translate-y-0.5"
                  aria-hidden
                />
              </a>
              <Link href="/shop" className="btn-outline group">
                Shop the lookbook
                <ArrowRight
                  className="size-3.5 transition-transform duration-500 group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </div>

            <ul className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-[9.5px] uppercase tracking-[0.14em] text-stone">
              <li>Local delivery 2–5 days</li>
              <li aria-hidden className="text-champagne">
                ◆
              </li>
              <li>Gift wrap included</li>
              <li aria-hidden className="text-champagne">
                ◆
              </li>
              <li>Nationwide courier</li>
            </ul>
          </div>

          <div className="relative lg:col-span-7">
            <ImageStack
              images={HERO_IMAGES}
              preload
              className="mx-auto w-[88%] max-w-[34rem] lg:ml-auto lg:mr-0 lg:w-[88%]"
            />

            <div className="surface-card relative z-20 -mt-6 ml-2 w-[82%] max-w-[17rem] px-5 py-4 sm:-mt-8 sm:ml-6">
              <p className="eyebrow text-champagne-dark">From the studio</p>
              <p className="mt-2 font-display text-[1.3rem] leading-tight">
                A lookbook for gifts that outlive the occasion.
              </p>
              <p className="mt-3 text-[9px] uppercase tracking-[0.15em] text-stone">
                Three chapters · one standard
              </p>
            </div>
          </div>
        </div>

        <nav aria-label="Lookbook chapters" className="container-lux relative pb-8 sm:pb-10">
          <ol className="grid border-t border-line sm:grid-cols-3">
            {CHAPTERS.map((chapter) => (
              <li
                key={chapter.number}
                className="border-b border-line last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
              >
                <a
                  href={`#chapter-${chapter.number}`}
                  className="group flex items-center justify-between gap-4 py-5 sm:px-6"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="font-display text-2xl text-oxblood">
                      {chapter.number}
                    </span>
                    <span className="text-[9.5px] uppercase tracking-[0.16em] text-ink-soft">
                      {chapter.name}
                    </span>
                  </span>
                  <ArrowDown
                    className="size-3.5 shrink-0 text-stone transition-transform duration-500 group-hover:translate-y-1"
                    aria-hidden
                  />
                </a>
              </li>
            ))}
          </ol>
        </nav>
      </section>

      {CHAPTERS.map((chapter) => (
        <Chapter key={chapter.number} chapter={chapter} />
      ))}

      <section className="container-lux pb-14 pt-2 sm:pb-20 sm:pt-6">
        <div className="surface-card surface-grid relative">
          <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-blush/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 size-48 rounded-full bg-champagne/10 blur-3xl" />

          <div className="relative grid lg:grid-cols-[1.05fr_0.95fr]">
            <div className="p-7 sm:p-10 lg:p-14">
              <p className="eyebrow text-champagne-dark">The closing note</p>
              <h2 className="mt-3 font-display text-[clamp(2.5rem,4.8vw,4.15rem)] leading-[0.98]">
                One good thing,
                <span className="block italic text-oxblood">chosen slowly.</span>
              </h2>
              <p className="mt-5 max-w-md text-[13px] leading-[1.9] text-stone">
                The lookbook is a starting point. The shop holds the full edit —
                watches, fragrance, fashion, shoes and ready-to-give boxes — and
                the gift finder narrows the house down in three questions. Local
                pieces arrive in 2–5 days; global finds are tracked from partner
                to door.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/shop" className="btn-primary group">
                  Shop the full edit
                  <ArrowRight
                    className="size-4 transition-transform duration-500 group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
                <Link href="/gift-finder" className="btn-outline group">
                  <Sparkles className="size-3.5" aria-hidden />
                  Find the right gift
                </Link>
              </div>

              <p className="mt-6 text-[9px] uppercase tracking-[0.16em] text-stone">
                Hand-wrapped · A note if you want one · Nationwide delivery
              </p>
            </div>

            <div className="relative min-h-[20rem] border-t border-line lg:border-l lg:border-t-0">
              <Image
                src="/images/editorial/hero-gifts.jpg"
                alt="A Black couple exchanging a wrapped gift"
                fill
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover object-[center_55%]"
              />
              <div className="surface-card absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 px-4 py-3">
                <div>
                  <p className="eyebrow text-champagne-dark">Volume 01</p>
                  <p className="mt-1 font-display text-xl italic leading-tight">
                    The Considered Edit
                  </p>
                </div>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line text-oxblood">
                  <Sparkles className="size-3.5" aria-hidden />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-lux flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-line py-6 text-[8.5px] uppercase tracking-[0.18em] text-stone">
        <p>The Considered Edit · Volume 01</p>
        <p>Johannesburg · South Africa</p>
        <p>Summer 2026/27</p>
      </div>
    </div>
  );
}
