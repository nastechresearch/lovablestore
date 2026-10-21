import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

export function ValentinesBanner() {
  return (
    <Reveal>
      <div className="relative overflow-hidden bg-oxblood text-ivory">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" aria-hidden>
          <span className="absolute -bottom-24 -left-10 font-display text-[24rem] italic leading-none">
            love
          </span>
        </div>
        <div className="relative grid lg:grid-cols-2">
          <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
            <p className="eyebrow flex items-center gap-3 text-champagne">
              <Heart className="size-3 fill-champagne" aria-hidden />
              14 February 2027 · The love edit
            </p>
            <h2 className="mt-5 max-w-lg font-display text-[clamp(2.5rem,5vw,4.3rem)] leading-[0.98]">
              Say it <span className="italic text-champagne">before</span> the
              roses sell out.
            </h2>
            <p className="mt-5 max-w-md text-[13px] leading-relaxed text-ivory/70">
              A considered collection for the people you&apos;d choose again.
              Signature scents, his-and-hers keepsakes, and gifts that arrive
              wrapped with a handwritten note.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/valentines"
                className="group inline-flex min-h-12 items-center justify-center gap-2.5 bg-ivory px-7 text-[10px] font-medium uppercase tracking-[0.18em] text-oxblood transition-colors hover:bg-champagne"
              >
                Shop the love edit
                <ArrowRight
                  className="size-3.5 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
              <Link
                href="/gift-finder"
                className="link-underline self-center py-3 text-[10px] uppercase tracking-[0.18em] text-ivory/80 transition-colors hover:text-champagne"
              >
                Not sure? Take the gift finder
              </Link>
            </div>
          </div>
          <div className="relative min-h-[19rem] lg:min-h-[32rem]">
            <Image
              src="/images/editorial/editorial-couple.jpg"
              alt="Two hands making a heart shape in golden sunset light"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-oxblood/40 via-transparent to-transparent" />
            <div className="absolute bottom-5 left-5 border border-ivory/25 bg-oxblood/40 px-4 py-3 backdrop-blur-sm sm:bottom-7 sm:left-7">
              <p className="text-[8px] uppercase tracking-[0.2em] text-champagne">
                Complimentary
              </p>
              <p className="mt-1 font-display text-lg">Gift wrap + handwritten note</p>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
