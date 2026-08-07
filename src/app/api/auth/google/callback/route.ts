import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createUserSession } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const stateStr = searchParams.get('state');

  let redirectPath = '/';
  if (stateStr) {
    try {
      const parsed = JSON.parse(Buffer.from(stateStr, 'base64url').toString('utf8'));
      if (parsed.redirectPath) redirectPath = parsed.redirectPath;
    } catch {
      // default /
    }
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const redirectUri = `${baseUrl.replace(/\/$/, '')}/api/auth/google/callback`;

  try {
    // 1. Tukar authorization code dengan tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error('Google token exchange error:', err);
      return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url));
    }

    const tokens = await tokenRes.json();

    // 2. Ambil profil user dari Google
    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) {
      return NextResponse.redirect(new URL('/?error=fetch_user_failed', request.url));
    }

    const googleUser = await userRes.json();
    // googleUser: { id, email, name, picture, verified_email }

    if (!googleUser.email) {
      return NextResponse.redirect(new URL('/?error=no_email', request.url));
    }

    // 3. Upsert user di database PostgreSQL via Prisma
    const dbUser = await prisma.user.upsert({
      where: { email: googleUser.email },
      update: {
        name: googleUser.name || googleUser.email.split('@')[0],
        image: googleUser.picture,
      },
      create: {
        email: googleUser.email,
        name: googleUser.name || googleUser.email.split('@')[0],
        image: googleUser.picture,
        emailVerified: googleUser.verified_email ? new Date() : null,
      },
    });

    // 4. Link atau update data Account OAuth Google
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: googleUser.id,
        },
      },
      update: {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : null,
        id_token: tokens.id_token,
      },
      create: {
        userId: dbUser.id,
        type: 'oauth',
        provider: 'google',
        providerAccountId: googleUser.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : null,
        id_token: tokens.id_token,
        token_type: tokens.token_type,
        scope: tokens.scope,
      },
    });

    // 5. Buat JWT cookie session untuk publik user
    await createUserSession({
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      image: dbUser.image,
      role: dbUser.role,
    });

    return NextResponse.redirect(new URL(redirectPath, request.url));
  } catch (error) {
    console.error('Google OAuth Callback Error:', error);
    return NextResponse.redirect(new URL('/?error=oauth_failed', request.url));
  }
}
