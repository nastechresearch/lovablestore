import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const EDITS = [
  {
    title: "For her",
    href: "/collections/for-her",
    image: "/images/editorial/hero-woman.jpg",
    alt: "Portrait of a stylish Black woman in an elegant dress",
    blurb: "Soft tailoring, signature scent and pieces chosen to feel like her.",
    note: "The soft edit",
  },
  {
    title: "For him",
    href: "/collections/for-him",
    image: "/images/editorial/editorial-men.jpg",
    alt: "A Black man in a tailored tuxedo",
    blurb: "Watches, leather and fragrance he will actually use.",
    note: "The considered edit",
  },
  {
    title: "For couples",
    href: "/collections/couples",
    image: "/images/editorial/editorial-couple.jpg",
    alt: "A couple exchanging a small wrapped gift",
    blurb: "His-and-hers sets, keepsakes and gifts for two.",
    note: "The together edit",
  },
];

export function RecipientCards() {
  return (
    <div className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:px-0 lg:gap-6">
      {EDITS.map((edit, index) => (
        <Reveal key={edit.href} delay={index * 0.08} className="snap-start">
          <Link
            href={edit.href}
            className="group relative block aspect-[4/5] w-[78vw] overflow-hidden bg-ivory-deep sm:aspect-[3/4] sm:w-auto"
          >
            <Image
              src={edit.image}
              alt={edit.alt}
              fill
              sizes="(max-width: 640px) 78vw, 33vw"
              className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 text-white">
              <span className="text-[10px] uppercase tracking-[0.2em] text-white/70">
                0{index + 1}
              </span>
              <span className="flex size-9 items-center justify-center rounded-full border border-white/40 transition-colors duration-300 group-hover:bg-white group-hover:text-oxblood">
                <ArrowUpRight className="size-4" aria-hidden />
              </span>
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
              <p className="text-[9px] uppercase tracking-[0.2em] text-champagne">
                {edit.note}
              </p>
              <h3 className="mt-2 font-display text-[2.1rem] leading-none sm:text-[2.3rem]">
                {edit.title}
              </h3>
              <p className="mt-2 max-w-[17rem] text-[11px] leading-relaxed text-white/75">
                {edit.blurb}
              </p>
              <span className="mt-4 inline-block border-b border-white/50 pb-1 text-[9px] uppercase tracking-[0.18em] transition-colors group-hover:border-champagne group-hover:text-champagne">
                Explore the edit
              </span>
            </div>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
