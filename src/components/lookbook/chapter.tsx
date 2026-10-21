import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ImageStack, type LookImage } from "@/components/lookbook/image-stack";

export type ChapterData = {
  number: string;
  name: string;
  title: string;
  accent: string;
  subtitle: string;
  copy: string;
  images: LookImage[];
  href: string;
  hrefNote: string;
  mood: string[];
  surface?: "plain" | "cream" | "deep";
  flip?: boolean;
};

const SURFACE_CLASSES: Record<NonNullable<ChapterData["surface"]>, string> = {
  plain: "",
  cream: "border-y border-line bg-cream",
  deep: "border-y border-line bg-ivory-deep/40",
};

export function Chapter({ chapter }: { chapter: ChapterData }) {
  const flip = chapter.flip ?? false;
  const surface = chapter.surface ?? "plain";

  return (
    <section
      id={`chapter-${chapter.number}`}
      aria-labelledby={`chapter-${chapter.number}-title`}
      className={`scroll-mt-24 ${SURFACE_CLASSES[surface]}`}
    >
      <div className="container-lux py-16 sm:py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-6">
          <div
            className={`relative lg:col-span-4 lg:row-start-1 ${
              flip ? "lg:col-start-9" : "lg:col-start-1"
            }`}
          >
            <div className="flex items-start justify-between gap-6 border-b border-line pb-5">
              <div>
                <p className="eyebrow text-champagne-dark">Chapter {chapter.number}</p>
                <p className="mt-2 font-display text-[1.35rem] italic leading-tight text-ink-soft">
                  {chapter.name}
                </p>
              </div>
              <span
                aria-hidden
                className="font-display text-[4rem] leading-[0.8] text-oxblood/70 sm:text-[4.6rem]"
              >
                {chapter.number}
              </span>
            </div>

            <h2
              id={`chapter-${chapter.number}-title`}
              className="mt-7 font-display text-[clamp(2.5rem,4.6vw,4rem)] leading-[0.98] tracking-[-0.015em]"
            >
              {chapter.title}
              <span className="block italic text-oxblood">{chapter.accent}</span>
            </h2>

            <p className="mt-5 font-display text-[1.35rem] italic leading-snug text-ink-soft">
              {chapter.subtitle}
            </p>
            <p className="mt-4 max-w-md text-[13px] leading-[1.9] text-stone">
              {chapter.copy}
            </p>

            <Link href={chapter.href} className="btn-outline group mt-8 w-fit">
              Shop the mood
              <ArrowUpRight
                className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
            <p className="mt-3 text-[9px] uppercase tracking-[0.16em] text-stone">
              {chapter.hrefNote}
            </p>
          </div>

          <div
            className={`relative lg:col-span-7 lg:row-start-1 ${
              flip ? "lg:col-start-1 lg:mt-12" : "lg:col-start-6 lg:mt-6"
            }`}
          >
            <div
              className={`mx-auto w-full max-w-[38rem] ${
                flip ? "lg:ml-0 lg:mr-auto" : "lg:ml-auto lg:mr-0"
              }`}
            >
              <ImageStack images={chapter.images} aspectClassName="aspect-[4/5]" />

              <div className="surface-card relative z-20 -mt-7 ml-4 w-fit max-w-[19rem] px-5 py-4 sm:-mt-9 sm:ml-8">
                <p className="eyebrow text-champagne-dark">Mood notes</p>
                <p className="mt-2 text-[10.5px] leading-relaxed text-ink-soft">
                  {chapter.mood.join(" · ")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
