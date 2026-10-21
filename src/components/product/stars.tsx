import { Star } from "lucide-react";

export function Stars({
  rating,
  className = "",
  size = "size-3.5",
}: {
  rating: number;
  className?: string;
  size?: string;
}) {
  return (
    <span className={`flex items-center gap-0.5 ${className}`} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`${size} ${
            index < Math.round(rating)
              ? "fill-champagne text-champagne"
              : "fill-transparent text-sand"
          }`}
          aria-hidden
        />
      ))}
    </span>
  );
}
