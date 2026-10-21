import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "View all",
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <Reveal>
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow flex items-center gap-3 text-champagne-dark">
            <span className="h-px w-7 bg-champagne-dark" aria-hidden />
            {eyebrow}
          </p>
          <h2 className="mt-4 font-display text-[clamp(2.1rem,4.6vw,3.7rem)] leading-[1.02]">
            {title}
          </h2>
          {description ? (
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone text-pretty">
              {description}
            </p>
          ) : null}
        </div>
        {href ? (
          <Link href={href} className="group btn-quiet shrink-0 self-start md:self-auto">
            {linkLabel}
            <ArrowRight
              className="size-3.5 transition-transform group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        ) : null}
      </div>
    </Reveal>
  );
}
