import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ signedIn: false });
  }
  return NextResponse.json({
    signedIn: true,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  });
}
