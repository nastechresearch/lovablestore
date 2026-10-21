const COMMON_PASSWORDS = new Set([
  "123456",
  "12345678",
  "123456789",
  "1234567890",
  "password",
  "password1",
  "password123",
  "qwerty",
  "qwerty123",
  "letmein",
  "welcome",
  "welcome1",
  "admin",
  "admin123",
  "iloveyou",
  "monkey",
  "dragon",
  "football",
  "abc123",
  "southafrica",
  "capetown",
  "joburg",
  "mzansi",
  "blacks-market",
  "lovable-store",
  "lovablestore",
]);

export type PasswordStrength = {
  score: number;
  label: string;
  issues: string[];
};

export function passwordStrength(
  password: string,
  context: string[] = [],
): PasswordStrength {
  const issues: string[] = [];
  if (password.length < 10) issues.push("Use at least 10 characters.");
  if (!/[a-z]/.test(password)) issues.push("Add a lowercase letter.");
  if (!/[A-Z]/.test(password)) issues.push("Add an uppercase letter.");
  if (!/[0-9]/.test(password)) issues.push("Add a number.");
  if (!/[^A-Za-z0-9]/.test(password)) issues.push("Add a symbol.");
  const lower = password.toLowerCase();
  if (COMMON_PASSWORDS.has(lower)) issues.push("That password is too common.");
  if (context.some((part) => part.length >= 3 && lower.includes(part.toLowerCase()))) {
    issues.push("Avoid using your name or email in the password.");
  }
  if (/(.)\1{3,}/.test(password)) issues.push("Avoid repeating the same character.");

  let score = 0;
  if (password.length >= 10) score += 1;
  if (password.length >= 14) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (issues.length > 0) score = Math.min(score, 2);
  score = Math.min(5, score);

  const label =
    score >= 5
      ? "Excellent"
      : score === 4
        ? "Strong"
        : score === 3
          ? "Good"
          : score === 2
            ? "Weak"
            : "Too weak";

  return { score, label, issues };
}
