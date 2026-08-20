import { NextResponse } from "next/server";
import { verifyUserSession, destroyUserSession } from "@/lib/auth";

export async function GET() {
  const session = await verifyUserSession();
  return NextResponse.json({ user: session });
}

export async function DELETE() {
  await destroyUserSession();
  return NextResponse.json({ success: true });
}
