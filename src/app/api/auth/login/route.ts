import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import {
  hashPassword,
  passwordNeedsUpgrade,
  verifyPassword,
} from "@/lib/password";
import { checkRateLimit, getClientAddress } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (
    !checkRateLimit(
      `admin-login:${getClientAddress(request)}`,
      10,
      15 * 60 * 1000,
    )
  ) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan login. Coba lagi nanti." },
      { status: 429 },
    );
  }

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password harus diisi." },
        { status: 400 },
      );
    }

    try {
      const user = await prisma.adminUser.findUnique({
        where: { email },
      });

      if (user) {
        if (await verifyPassword(password, user.passwordHash)) {
          if (passwordNeedsUpgrade(user.passwordHash)) {
            await prisma.adminUser.update({
              where: { id: user.id },
              data: { passwordHash: await hashPassword(password) },
            });
          }
          await createSession(user.email);
          return NextResponse.json({ success: true, email: user.email });
        }
      }
    } catch {
      // Fallback if DB not ready
    }

    return NextResponse.json(
      { error: "Email atau password salah." },
      { status: 401 },
    );
  } catch {
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 },
    );
  }
}
