import Link from "next/link";
import { ArrowRight, Globe2, MapPin } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const SOURCES = [
  {
    icon: MapPin,
    label: "Local first",
    title: "Made and held in South Africa",
    copy: "Our local partners keep stock close. Most local orders leave Johannesburg or Cape Town within a day and arrive in 2–5 days.",
    meta: "2–5 days · free over R950",
    href: "/collections/local",
    cta: "Shop local finds",
    dark: false,
  },
  {
    icon: Globe2,
    label: "Global finds",
    title: "The world, without the guesswork",
    copy: "A small edit sourced direct from vetted partners. Every global item shows its true lead time before you pay.",
    meta: "12–20 days · tracked",
    href: "/collections/global",
    cta: "Shop global finds",
    dark: true,
  },
];

export function SourceStrip() {
  return (
    <div className="grid gap-3 md:grid-cols-2 md:gap-5">
      {SOURCES.map((source, index) => {
        const Icon = source.icon;
        return (
          <Reveal key={source.title} delay={index * 0.08}>
            <Link
              href={source.href}
              className={`group relative flex h-full flex-col justify-between overflow-hidden p-7 sm:p-9 ${
                source.dark
                  ? "night-panel text-ivory"
                  : "border border-line bg-cream text-ink"
              }`}
            >
              {source.dark ? (
                <span
                  className="pointer-events-none absolute -right-14 -top-14 size-52 rounded-full border border-champagne/20"
                  aria-hidden
                />
              ) : null}
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`flex size-10 items-center justify-center rounded-full border ${
                      source.dark
                        ? "border-champagne/40 text-champagne"
                        : "border-champagne/60 text-oxblood"
                    }`}
                  >
                    <Icon className="size-4" strokeWidth={1.5} aria-hidden />
                  </span>
                  <span
                    className={`text-[9px] uppercase tracking-[0.2em] ${
                      source.dark ? "text-ivory/50" : "text-stone"
                    }`}
                  >
                    {source.label}
                  </span>
                </div>
                <h3 className="mt-8 max-w-sm font-display text-[clamp(1.7rem,3vw,2.4rem)] leading-[1.05]">
                  {source.title}
                </h3>
                <p
                  className={`mt-3 max-w-md text-[12px] leading-relaxed ${
                    source.dark ? "text-ivory/65" : "text-stone"
                  }`}
                >
                  {source.copy}
                </p>
              </div>
              <div
                className={`mt-8 flex items-center justify-between border-t pt-4 text-[9px] uppercase tracking-[0.18em] ${
                  source.dark ? "border-ivory/15" : "border-line"
                }`}
              >
                <span className={source.dark ? "text-champagne" : "text-champagne-dark"}>
                  {source.meta}
                </span>
                <span className="flex items-center gap-2 transition-transform duration-300 group-hover:translate-x-1">
                  {source.cta}
                  <ArrowRight className="size-3.5" aria-hidden />
                </span>
              </div>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
