const MESSAGES = [
  "Complimentary gift wrap on every order",
  "Free delivery over R950",
  "Local pieces in 2–5 days",
  "Global finds sourced direct",
  "PayFast secure checkout",
  "Proudly Johannesburg",
];

export function Marquee() {
  return (
    <section
      className="overflow-hidden border-y border-oxblood-deep/40 bg-oxblood py-3 text-ivory"
      aria-label="Delivery and gifting information"
    >
      <ul className="sr-only">
        {MESSAGES.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
      <div className="animate-marquee flex w-max hover:[animation-play-state:paused]">
        {[0, 1].map((copy) => (
          <div className="flex shrink-0 items-center" key={copy} aria-hidden>
            {MESSAGES.map((message) => (
              <div key={`${copy}-${message}`} className="flex items-center">
                <span className="whitespace-nowrap px-7 text-[10px] font-medium uppercase tracking-[0.22em] text-ivory/90">
                  {message}
                </span>
                <span className="text-[7px] text-champagne">◆</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
