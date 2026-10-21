export type CardBrandId = "visa" | "mastercard" | "amex" | "discover" | "unknown";

export type CardBrand = {
  id: CardBrandId;
  label: string;
  cvvLength: number;
  maxDigits: number;
  groups: number[];
};

export const CARD_BRANDS: Record<CardBrandId, CardBrand> = {
  visa: {
    id: "visa",
    label: "Visa",
    cvvLength: 3,
    maxDigits: 19,
    groups: [4, 4, 4, 4, 3],
  },
  mastercard: {
    id: "mastercard",
    label: "Mastercard",
    cvvLength: 3,
    maxDigits: 16,
    groups: [4, 4, 4, 4],
  },
  amex: {
    id: "amex",
    label: "American Express",
    cvvLength: 4,
    maxDigits: 15,
    groups: [4, 6, 5],
  },
  discover: {
    id: "discover",
    label: "Discover",
    cvvLength: 3,
    maxDigits: 16,
    groups: [4, 4, 4, 4],
  },
  unknown: {
    id: "unknown",
    label: "Card",
    cvvLength: 3,
    maxDigits: 19,
    groups: [4, 4, 4, 4, 3],
  },
};

export const DEMO_CARD = {
  number: "4242424242424242",
  name: "Thandi Mokoena",
  expiry: "12/30",
  cvv: "123",
} as const;

export function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function isMastercardRange(digits: string): boolean {
  if (digits.length < 2) return false;
  const two = Number(digits.slice(0, 2));
  if (two >= 51 && two <= 55) return true;
  if (digits.length >= 4) {
    const four = Number(digits.slice(0, 4));
    return four >= 2221 && four <= 2720;
  }
  // 2221–2720 begins with 2, so show the Mastercard mark as soon as "2" is typed.
  return digits[0] === "2";
}

export function detectCardBrand(value: string): CardBrand {
  const digits = digitsOnly(value);
  if (!digits) return CARD_BRANDS.unknown;
  if (digits[0] === "4") return CARD_BRANDS.visa;
  if (isMastercardRange(digits)) return CARD_BRANDS.mastercard;
  if (/^3[47]/.test(digits)) return CARD_BRANDS.amex;
  if (/^(6011|65|64[4-9])/.test(digits)) return CARD_BRANDS.discover;
  return CARD_BRANDS.unknown;
}

export function luhnValid(value: string): boolean {
  const digits = digitsOnly(value);
  if (digits.length < 12) return false;
  let sum = 0;
  let double = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

export function formatCardNumber(value: string): string {
  const brand = detectCardBrand(value);
  const digits = digitsOnly(value).slice(0, brand.maxDigits);
  const parts: string[] = [];
  let cursor = 0;
  for (const size of brand.groups) {
    if (cursor >= digits.length) break;
    parts.push(digits.slice(cursor, cursor + size));
    cursor += size;
  }
  return parts.join(" ");
}

export function cardDigits(value: string): string {
  return digitsOnly(value).slice(0, detectCardBrand(value).maxDigits);
}

export function maskedCardNumber(value: string): string {
  const digits = cardDigits(value);
  if (!digits) return "•••• •••• •••• ••••";
  const visible = digits.slice(-4);
  const dots = "•".repeat(Math.max(0, Math.min(12, digits.length - 4)));
  return `${dots} ${visible}`.trim();
}

export function formatExpiry(value: string): string {
  let digits = digitsOnly(value).slice(0, 4);
  if (!digits) return "";
  if (digits.length === 1 && Number(digits[0]) > 1) {
    digits = `0${digits}`;
  }
  const month = digits.slice(0, 2);
  if (digits.length <= 2) return month;
  return `${month}/${digits.slice(2)}`;
}

export function expiryParts(value: string): { month: number; year: number } | null {
  const digits = digitsOnly(value);
  if (digits.length !== 4) return null;
  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2));
  if (month < 1 || month > 12) return null;
  return { month, year };
}

export function isExpiryValid(value: string, now = new Date()): boolean {
  const parts = expiryParts(value);
  if (!parts) return false;
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (parts.year < currentYear) return false;
  if (parts.year === currentYear && parts.month < currentMonth) return false;
  return parts.year <= currentYear + 20;
}

export function isCvvValid(value: string, brand: CardBrand): boolean {
  const digits = digitsOnly(value);
  return digits.length === brand.cvvLength;
}

export type CardFields = {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
};

export type CardErrors = Partial<Record<keyof CardFields | "form", string>>;

export function validateCard(fields: CardFields): CardErrors {
  const errors: CardErrors = {};
  const brand = detectCardBrand(fields.number);
  const digits = cardDigits(fields.number);

  if (digits.length < 12) {
    errors.number = "Enter the full card number.";
  } else if (!luhnValid(digits)) {
    errors.number = "That card number doesn't check out. Review the digits.";
  } else if (digits.length > brand.maxDigits) {
    errors.number = `${brand.label} numbers are ${brand.maxDigits} digits.`;
  }

  if (fields.name.trim().length < 2) {
    errors.name = "Add the name printed on the card.";
  }

  if (!expiryParts(fields.expiry)) {
    errors.expiry = "Use MM/YY.";
  } else if (!isExpiryValid(fields.expiry)) {
    errors.expiry = "That expiry date has passed.";
  }

  if (!isCvvValid(fields.cvv, brand)) {
    errors.cvv = `${brand.cvvLength} digits, like the code on the back.`;
  }

  return errors;
}
