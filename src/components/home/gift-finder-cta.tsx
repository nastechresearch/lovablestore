import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const STEPS = [
  { number: "01", label: "Who is it for?" },
  { number: "02", label: "What is the moment?" },
  { number: "03", label: "What feels right to spend?" },
];

export function GiftFinderCta() {
  return (
    <Reveal>
      <div className="night-panel relative overflow-hidden px-6 py-12 text-ivory sm:px-10 sm:py-16 lg:px-16">
        <span
          className="pointer-events-none absolute -right-20 -top-28 size-80 rounded-full border border-champagne/15"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute -bottom-40 -left-16 size-[26rem] rounded-full border border-champagne/10"
          aria-hidden
        />
        <div className="relative grid gap-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <p className="eyebrow text-champagne">The gift finder</p>
            <h2 className="mt-4 max-w-xl font-display text-[clamp(2.4rem,5vw,4.2rem)] leading-[0.98]">
              Three questions.
              <br />
              <span className="italic text-champagne">One gift they&apos;ll keep.</span>
            </h2>
            <p className="mt-5 max-w-md text-[13px] leading-relaxed text-ivory/65">
              Tell us who it&apos;s for, the moment and your budget. We&apos;ll
              narrow the edit to a short list worth giving.
            </p>
            <Link
              href="/gift-finder"
              className="group mt-7 inline-flex min-h-12 items-center gap-2.5 border border-champagne px-7 text-[10px] font-medium uppercase tracking-[0.18em] text-champagne transition-colors hover:bg-champagne hover:text-ink"
            >
              Find their gift
              <ArrowRight
                className="size-3.5 transition-transform group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
          <div className="lg:col-span-5 lg:justify-self-end lg:pl-8">
            <ol className="w-full max-w-sm">
              {STEPS.map((step) => (
                <li
                  key={step.number}
                  className="flex items-baseline gap-5 border-b border-ivory/12 py-4 first:border-t"
                >
                  <span className="font-display text-lg italic text-champagne">
                    {step.number}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.15em] text-ivory/75">
                    {step.label}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
