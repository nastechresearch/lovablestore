import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { CATEGORY_META } from "@/lib/constants";

const ORDER = ["Gifts", "Watches", "Fragrance", "Women", "Men", "Shoes"];

export function CategoryGrid() {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-7 md:grid-cols-3 md:gap-x-5 md:gap-y-9">
      {ORDER.map((category, index) => {
        const meta = CATEGORY_META[category];
        if (!meta) return null;
        return (
          <Reveal key={category} delay={(index % 3) * 0.06}>
            <Link href={meta.href} className="group block">
              <div className="relative aspect-[4/5] overflow-hidden bg-ivory-deep">
                <Image
                  src={meta.image}
                  alt={`${category} at Lovable Store`}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                />
                <span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-cream/90 text-ink opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:shadow-soft">
                  <ArrowUpRight className="size-3.5" aria-hidden />
                </span>
              </div>
              <div className="mt-3 flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-display text-[1.45rem] leading-none">
                    {meta.label}
                  </h3>
                  <p className="mt-1.5 text-[10px] leading-relaxed text-stone">
                    {meta.blurb}
                  </p>
                </div>
                <span className="pt-1 text-[9px] uppercase tracking-[0.18em] text-stone/60">
                  0{index + 1}
                </span>
              </div>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
