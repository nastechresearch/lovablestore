const FILMS = [
  {
    src: "/videos/considered-edit.mp4",
    poster: "/images/editorial/editorial-fashion.jpg",
    label: "Film 01",
    title: "The Considered Edit",
    note: "Weddings, gifting and the pieces that stay in rotation.",
    duration: "0:17",
  },
  {
    src: "/videos/gifting-moments.mp4",
    poster: "/images/editorial/hero-gifts.jpg",
    label: "Film 02",
    title: "Gifting Moments",
    note: "The unwrapping, the pause, the thank-you.",
    duration: "0:17",
  },
  {
    src: "/videos/after-hours.mp4",
    poster: "/images/editorial/editorial-suit.jpg",
    label: "Film 03",
    title: "After Hours",
    note: "Tailoring, knitwear and a slower kind of evening.",
    duration: "0:17",
  },
];

function FilmCard({
  film,
  large = false,
}: {
  film: (typeof FILMS)[number];
  large?: boolean;
}) {
  return (
    <figure
      className={`group relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-black ${
        large ? "aspect-[16/11] lg:aspect-auto lg:min-h-[34rem]" : "aspect-[16/10]"
      }`}
    >
      <video
        className="absolute inset-0 size-full object-cover opacity-90 transition-opacity duration-700 group-hover:opacity-100"
        src={film.src}
        poster={film.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={`${film.title} — a short Lovable Store film`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/20" />
      <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white sm:p-6">
        <div>
          <p className="text-[9px] uppercase tracking-[0.22em] text-champagne">
            {film.label} · {film.duration}
          </p>
          <h3
            className={`mt-2 font-display leading-none ${
              large ? "text-3xl sm:text-4xl" : "text-2xl"
            }`}
          >
            {film.title}
          </h3>
          <p className="mt-2 max-w-xs text-[11px] leading-relaxed text-white/70">
            {film.note}
          </p>
        </div>
        <span className="hidden size-10 shrink-0 items-center justify-center rounded-full border border-white/35 text-white/80 sm:flex">
          <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 size-3.5" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
      </figcaption>
    </figure>
  );
}

export function BrandFilm() {
  return (
    <section className="night-panel border-y border-white/10 bg-black">
      <div className="container-lux py-16 sm:py-20 lg:py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow text-champagne">The house films</p>
            <h2 className="mt-3 font-display text-4xl leading-[1.02] sm:text-5xl">
              Three moods.
              <br />
              <span className="italic text-champagne">One considered edit.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-white/60">
            Shot around the pieces in this volume — a wedding morning, a gift
            exchanged at home, and the quiet hour after. Sound off, slow down.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <FilmCard film={FILMS[0]} large />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <FilmCard film={FILMS[1]} />
            <FilmCard film={FILMS[2]} />
          </div>
        </div>
      </div>
    </section>
  );
}
