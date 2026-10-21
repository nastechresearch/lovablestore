import { Gift } from "lucide-react";

export function SealBadge({ className = "" }: { className?: string }) {
  return (
    <div
      className={`relative flex size-[112px] items-center justify-center rounded-full border border-champagne/60 bg-cream/90 text-oxblood shadow-soft backdrop-blur-sm ${className}`}
      aria-label="Complimentary gift wrap included"
    >
      <svg
        viewBox="0 0 120 120"
        className="animate-spin-slow absolute inset-0 size-full"
        aria-hidden
      >
        <defs>
          <path
            id="seal-circle"
            d="M60,60 m-43,0 a43,43 0 1,1 86,0 a43,43 0 1,1 -86,0"
          />
        </defs>
        <text className="fill-oxblood text-[8.2px] font-medium uppercase tracking-[0.24em]">
          <textPath href="#seal-circle" startOffset="0%">
            Complimentary gift wrap · Delivered across SA ·
          </textPath>
        </text>
      </svg>
      <Gift className="size-7" strokeWidth={1.4} aria-hidden />
    </div>
  );
}
