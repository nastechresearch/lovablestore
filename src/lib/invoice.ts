export const VAT_RATE = 0.15;

export function invoiceNumber(order: { number: string; createdAt: Date }): string {
  return `INV-${order.createdAt.getUTCFullYear()}-${order.number.replace(/^LS-/, "")}`;
}

export function vatBreakdown(totalInclusive: number, rate = VAT_RATE) {
  const totalExcluding = Math.round(totalInclusive / (1 + rate));
  return {
    rate,
    totalIncluding: totalInclusive,
    totalExcluding,
    vat: totalInclusive - totalExcluding,
  };
}
