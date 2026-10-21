import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Clock3,
  RefreshCw,
} from "lucide-react";
import { GUIDES, GUIDE_CATEGORIES, getGuide } from "@/lib/guides";
import { formatDate } from "@/lib/format";
import { STORE_URL } from "@/lib/constants";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: "Guide not found" };

  return {
    title: guide.title,
    description: guide.excerpt,
    alternates: {
      canonical: `/guides/${guide.slug}`,
    },
    openGraph: {
      type: "article",
      url: `/guides/${guide.slug}`,
      title: guide.title,
      description: guide.excerpt,
      siteName: "Lovable Store",
      locale: "en_ZA",
      publishedTime: guide.updated,
      modifiedTime: guide.updated,
      section: guide.category,
    },
    twitter: {
      card: "summary",
      title: guide.title,
      description: guide.excerpt,
    },
  };
}

export default async function GuidePage({ params }: { params: Params }) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();

  const guideNumber = GUIDES.findIndex((item) => item.slug === guide.slug) + 1;
  const categoryMeta = GUIDE_CATEGORIES.find(
    (category) => category.label === guide.category,
  );
  const baseUrl = STORE_URL.replace(/\/$/, "");
  const guideUrl = `${baseUrl}/guides/${guide.slug}`;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.excerpt,
    inLanguage: "en-ZA",
    articleSection: guide.category,
    datePublished: guide.updated,
    dateModified: guide.updated,
    mainEntityOfPage: guideUrl,
    url: guideUrl,
    author: {
      "@type": "Organization",
      name: "Lovable Store",
      url: baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Lovable Store",
      url: baseUrl,
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="relative overflow-hidden border-b border-line bg-cream">
        <div className="surface-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden />
        <div className="container-lux relative py-8 sm:py-12 lg:py-14">
          <nav
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] uppercase tracking-[0.16em] text-stone"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors hover:text-oxblood">
              Home
            </Link>
            <span className="text-champagne">/</span>
            <Link href="/guides" className="transition-colors hover:text-oxblood">
              Guides
            </Link>
            <span className="text-champagne">/</span>
            <span className="text-ink">{guide.category}</span>
          </nav>

          <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-end lg:gap-14">
            <div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="grid-badge">{guide.category}</span>
                <span className="inline-flex items-center gap-1.5 text-[8.5px] uppercase tracking-[0.14em] text-stone">
                  <Clock3 className="size-3 text-champagne-dark" aria-hidden />
                  {guide.readingMinutes} min read
                </span>
                <span className="inline-flex items-center gap-1.5 text-[8.5px] uppercase tracking-[0.14em] text-stone">
                  <RefreshCw className="size-3 text-champagne-dark" aria-hidden />
                  Updated {formatDate(guide.updated)}
                </span>
              </div>

              <h1 className="mt-5 max-w-[17ch] font-display text-[clamp(2.6rem,5.6vw,4.9rem)] leading-[0.96] text-ink">
                {guide.title}
              </h1>
              <p className="mt-5 max-w-2xl text-[13px] leading-relaxed text-stone text-pretty sm:text-sm">
                {guide.intro}
              </p>
            </div>

            <aside className="surface-card surface-grid relative hidden p-6 lg:block">
              <div className="flex items-start justify-between gap-4">
                <p className="eyebrow text-champagne-dark">Field note</p>
                <span className="font-display text-5xl italic leading-none text-champagne-dark/50">
                  {String(guideNumber).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-4 font-display text-xl leading-tight text-ink">
                {categoryMeta?.blurb ?? "Practical advice from the studio."}
              </p>
              <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4">
                <div>
                  <dt className="text-[8.5px] uppercase tracking-[0.16em] text-stone">
                    Reading
                  </dt>
                  <dd className="mt-1 text-[11px] text-ink-soft">
                    {guide.readingMinutes} minutes
                  </dd>
                </div>
                <div>
                  <dt className="text-[8.5px] uppercase tracking-[0.16em] text-stone">
                    Reviewed
                  </dt>
                  <dd className="mt-1 text-[11px] text-ink-soft">
                    {formatDate(guide.updated)}
                  </dd>
                </div>
              </dl>
              <a
                href="#section-1"
                className="mt-5 inline-flex items-center gap-2 border-t border-line pt-4 text-[9px] uppercase tracking-[0.14em] text-oxblood transition-colors hover:text-oxblood-deep"
              >
                Start reading
                <ArrowDown className="size-3.5" aria-hidden />
              </a>
            </aside>
          </div>
        </div>
      </section>

      <div className="container-lux py-10 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="eyebrow text-stone">In this guide</p>
              <nav className="mt-4" aria-label="Table of contents">
                <ol className="border-l border-line">
                  {guide.sections.map((section, index) => (
                    <li key={section.heading}>
                      <a
                        href={`#section-${index + 1}`}
                        className="group -ml-px flex gap-3 border-l border-transparent py-2.5 pl-4 pr-2 text-[10.5px] leading-snug text-stone transition-colors hover:border-oxblood hover:text-oxblood"
                      >
                        <span className="font-display text-base italic leading-none text-champagne-dark">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {section.heading}
                      </a>
                    </li>
                  ))}
                  <li>
                    <a
                      href="#faq"
                      className="group -ml-px flex gap-3 border-l border-transparent py-2.5 pl-4 pr-2 text-[10.5px] leading-snug text-stone transition-colors hover:border-oxblood hover:text-oxblood"
                    >
                      <span className="font-display text-base italic leading-none text-champagne-dark">
                        ?
                      </span>
                      Questions
                    </a>
                  </li>
                </ol>
              </nav>

              <div className="surface-card mt-6 p-4">
                <p className="text-[8.5px] uppercase tracking-[0.16em] text-stone">
                  Need a person?
                </p>
                <p className="mt-2 text-[11px] leading-relaxed text-stone">
                  The studio answers within one business day, in SAST.
                </p>
                <Link
                  href="/contact"
                  className="mt-3 inline-flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] text-oxblood transition-colors hover:text-oxblood-deep"
                >
                  Ask the studio
                  <ArrowUpRight className="size-3" aria-hidden />
                </Link>
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <details className="surface-card group p-5 lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[10px] uppercase tracking-[0.16em] text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="inline-flex items-center gap-2">
                  <BookOpen className="size-3.5 text-champagne-dark" aria-hidden />
                  Jump to a section
                </span>
                <span className="text-lg leading-none text-champagne-dark transition-transform duration-300 group-open:rotate-45">
                  +
                </span>
              </summary>
              <nav className="mt-4 grid gap-2 border-t border-line pt-4" aria-label="Table of contents">
                {guide.sections.map((section, index) => (
                  <a
                    key={section.heading}
                    href={`#section-${index + 1}`}
                    className="flex gap-3 text-[11px] leading-snug text-stone transition-colors hover:text-oxblood"
                  >
                    <span className="font-display text-base italic leading-none text-champagne-dark">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {section.heading}
                  </a>
                ))}
                <a
                  href="#faq"
                  className="flex gap-3 border-t border-line pt-3 text-[11px] leading-snug text-stone transition-colors hover:text-oxblood"
                >
                  <span className="font-display text-base italic leading-none text-champagne-dark">
                    ?
                  </span>
                  Questions
                </a>
              </nav>
            </details>

            <article className="mt-8 space-y-10 lg:mt-0">
              {guide.sections.map((section, index) => (
                <section
                  key={section.heading}
                  id={`section-${index + 1}`}
                  className="scroll-mt-28 border-t border-line pt-8 first:border-t-0 first:pt-0"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-5">
                    <span className="font-display text-2xl italic leading-none text-oxblood sm:w-8 sm:pt-1">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-display text-[1.8rem] leading-tight text-ink sm:text-[2rem]">
                        {section.heading}
                      </h2>
                      <p className="mt-3 text-[13px] leading-[1.85] text-ink-soft">
                        {section.body}
                      </p>
                      {section.bullets ? (
                        <ul className="mt-5 grid gap-3">
                          {section.bullets.map((bullet) => (
                            <li
                              key={bullet}
                              className="flex gap-3 text-[12px] leading-relaxed text-stone"
                            >
                              <span
                                className="mt-[0.55rem] h-px w-3 shrink-0 bg-champagne-dark"
                                aria-hidden
                              />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </section>
              ))}
            </article>

            <section
              id="faq"
              className="mt-12 scroll-mt-28 border-t border-line pt-8"
            >
              <p className="eyebrow text-champagne-dark">Quick answers</p>
              <h2 className="mt-2 font-display text-[clamp(1.9rem,3.5vw,2.7rem)] leading-tight text-ink">
                Frequently asked.
              </h2>
              <div className="mt-6 divide-y divide-line border-y border-line">
                {guide.faq.map((item) => (
                  <details key={item.q} className="group py-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[12.5px] font-medium leading-snug text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                      {item.q}
                      <span
                        className="grid size-6 shrink-0 place-items-center rounded-full border border-line text-champagne-dark transition-transform duration-300 group-open:rotate-45"
                        aria-hidden
                      >
                        +
                      </span>
                    </summary>
                    <p className="mt-3 max-w-2xl pr-8 text-[12px] leading-relaxed text-stone">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            <section className="mt-12 border-t border-line pt-8">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow text-champagne-dark">Keep going</p>
                  <h2 className="mt-2 font-display text-[clamp(1.9rem,3.5vw,2.7rem)] leading-tight text-ink">
                    Related reading.
                  </h2>
                </div>
                <Link
                  href="/guides"
                  className="hidden items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-stone transition-colors hover:text-oxblood sm:inline-flex"
                >
                  All guides
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {guide.relatedLinks.map((link, index) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-cream px-4 py-3.5 text-[11.5px] text-ink-soft transition-colors hover:border-champagne-dark hover:text-oxblood"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="font-display text-base italic text-champagne-dark">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {link.label}
                    </span>
                    <ArrowUpRight
                      className="size-3.5 shrink-0 text-champagne-dark transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                ))}
              </div>

              <Link
                href="/guides"
                className="mt-4 inline-flex items-center gap-2 text-[9px] uppercase tracking-[0.14em] text-stone transition-colors hover:text-oxblood sm:hidden"
              >
                All guides
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            </section>

            <section className="mt-12">
              <div className="night-panel relative overflow-hidden rounded-[var(--radius-card)] border border-line p-7 text-ivory sm:p-9">
                <div
                  className="surface-grid pointer-events-none absolute inset-0 opacity-30"
                  aria-hidden
                />
                <div className="relative max-w-2xl">
                  <p className="eyebrow text-champagne">From reading to giving</p>
                  <h2 className="mt-3 font-display text-[clamp(1.9rem,4vw,3rem)] leading-[1.02]">
                    The edit is ready when you are.
                  </h2>
                  <p className="mt-3 text-[11.5px] leading-relaxed text-ivory/65">
                    Browse local and imported pieces with delivery dates shown,
                    or tell the studio what you need and when. We will keep it
                    human.
                  </p>
                  <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                    <Link href="/shop" className="btn-primary whitespace-nowrap">
                      Shop the edit
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-ivory/30 px-6 text-[9px] uppercase tracking-[0.16em] text-ivory transition-colors hover:bg-ivory hover:text-ink"
                    >
                      Ask the studio
                      <ArrowUpRight className="size-3.5" aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
