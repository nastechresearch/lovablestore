import Link from "next/link";
import type { ReactNode } from "react";

export function AdminHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
      <div>
        <p className="eyebrow text-champagne-dark">{eyebrow}</p>
        <h1 className="mt-2 font-display text-[clamp(2.2rem,4vw,3.4rem)] leading-[0.98]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-xl text-[12px] leading-relaxed text-stone">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex flex-wrap items-center gap-2">{action}</div> : null}
    </div>
  );
}

export function AdminStat({
  label,
  value,
  hint,
  href,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  tone?: "default" | "accent" | "warning";
}) {
  const content = (
    <div
      className={`h-full border p-5 transition-colors ${
        tone === "accent"
          ? "border-oxblood bg-oxblood text-ivory"
          : tone === "warning"
            ? "border-champagne-dark/40 bg-champagne/10"
            : "border-line bg-cream hover:border-champagne"
      }`}
    >
      <p
        className={`text-[9px] uppercase tracking-[0.16em] ${
          tone === "accent" ? "text-ivory" : "text-stone"
        }`}
      >
        {label}
      </p>
      <p className="mt-3 font-display text-4xl leading-none">{value}</p>
      {hint ? (
        <p
          className={`mt-2 text-[10px] ${
            tone === "accent" ? "text-ivory" : "text-stone"
          }`}
        >
          {hint}
        </p>
      ) : null}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toUpperCase();
  const tone =
    normalized === "PAID" ||
    normalized === "DELIVERED" ||
    normalized === "CONNECTED" ||
    normalized === "ACTIVE" ||
    normalized === "SHIPPED" ||
    normalized === "PACKED"
      ? "bg-oxblood/10 text-oxblood"
      : normalized === "CANCELLED" ||
          normalized === "ERROR" ||
          normalized === "FAILED" ||
          normalized === "ARCHIVED"
        ? "bg-ink/8 text-stone"
        : "bg-champagne/20 text-champagne-dark";

  return (
    <span className={`inline-flex px-2 py-1 text-[8.5px] font-medium uppercase tracking-[0.12em] ${tone}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}

export function EmptyState({
  title,
  copy,
  action,
}: {
  title: string;
  copy: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-line bg-cream p-10 text-center">
      <p className="font-display text-3xl">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-[12px] leading-relaxed text-stone">{copy}</p>
      {action ? <div className="mt-5 flex justify-center gap-2">{action}</div> : null}
    </div>
  );
}

export function AdminField({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <span className="label">{label}</span>
      {children}
      {error ? <p className="mt-1.5 text-[11px] text-oxblood">{error}</p> : null}
      {hint ? <p className="mt-1.5 text-[10px] text-stone">{hint}</p> : null}
    </div>
  );
}
