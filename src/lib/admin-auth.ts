import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "bm_admin";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function secret(): string {
  return process.env.ADMIN_COOKIE_SECRET || "blacks-market-dev-secret";
}

function sign(issuedAt: string): string {
  return createHmac("sha256", secret())
    .update(`blacks-market-admin-session:${issuedAt}`)
    .digest("hex");
}

function adminToken(): string {
  const issuedAt = Date.now().toString();
  return `${issuedAt}.${sign(issuedAt)}`;
}

function tokenIsValid(token: string): boolean {
  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;
  const issued = Number(issuedAt);
  if (!Number.isFinite(issued) || issued <= 0) return false;
  const age = Date.now() - issued;
  if (age < 0 || age > SESSION_TTL_MS) return false;
  const expected = sign(issuedAt);
  if (signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function verifyAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "blacks-market-admin";
  const suppliedBuffer = Buffer.from(password);
  const expectedBuffer = Buffer.from(expected);
  if (suppliedBuffer.length !== expectedBuffer.length) return false;
  return timingSafeEqual(suppliedBuffer, expectedBuffer);
}

export async function createAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, adminToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const supplied = cookieStore.get(COOKIE_NAME)?.value;
  if (!supplied) return false;
  return tokenIsValid(supplied);
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}
