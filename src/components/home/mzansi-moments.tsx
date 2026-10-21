import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import { getMomentCalendar, TONE_CLASSES } from "@/lib/moments";
import { SectionHeading } from "@/components/home/section-heading";

export function MzansiMoments() {
  const { all } = getMomentCalendar();
  const picks = all.slice(0, 4);

  return (
    <section className="container-lux py-16 sm:py-20 lg:py-24">
      <SectionHeading
        eyebrow="The Mzansi calendar"
        title="Gifts for the days that matter here."
        description="From Heritage Day and Women's Day to payday Fridays, Diwali and the December table — the edit is planned around the South African calendar."
        href="/moments"
        linkLabel="See every moment"
      />
      <div className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {picks.map((moment, index) => {
          const tone = TONE_CLASSES[moment.tone];
          return (
            <Link
              key={moment.slug}
              href={`/tag/${moment.tag}`}
              className={`group relative flex flex-col justify-between overflow-hidden border p-5 transition-transform duration-500 hover:-translate-y-1 ${tone.surface} ${tone.ink} ${tone.line}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[8px] uppercase tracking-[0.16em] ${tone.chip}`}>
                    <CalendarDays className="size-2.5" aria-hidden />
                    {moment.live ? "On now" : moment.dateLabel}
                  </span>
                  <span className="text-[8px] uppercase tracking-[0.14em] opacity-45">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-display text-[1.5rem] leading-tight">{moment.name}</h3>
                <p className="mt-2 text-[10px] leading-relaxed opacity-70">{moment.blurb}</p>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-current/15 pt-3">
                <span className="text-[8.5px] uppercase tracking-[0.12em] opacity-60">
                  {moment.windowLabel}
                </span>
                <ArrowRight className="size-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
