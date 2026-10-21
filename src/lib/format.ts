export function formatZAR(cents: number): string {
  const rands = Math.round(cents / 100);
  return `R${rands.toLocaleString("en-ZA")}`;
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: Date | string): string {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function shippingForSubtotal(subtotalCents: number): number {
  return subtotalCents >= 95000 ? 0 : 8500;
}
