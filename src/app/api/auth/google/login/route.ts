import { NextResponse } from "next/server";
import { createOAuthState } from "@/lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectPath = searchParams.get("redirect") || "/";

  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "GOOGLE_CLIENT_ID belum dikonfigurasi di file .env" },
      { status: 500 },
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const redirectUri = `${baseUrl.replace(/\/$/, "")}/api/auth/google/callback`;

  const scope = encodeURIComponent("openid email profile");
  const state = await createOAuthState(redirectPath);

  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri,
  )}&response_type=code&scope=${scope}&state=${state}&prompt=select_account`;

  return NextResponse.redirect(googleAuthUrl);
}
