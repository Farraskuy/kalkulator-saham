import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createUserSession, verifyOAuthState } from '@/lib/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectPath = await verifyOAuthState(searchParams.get('state'));

  if (!code || !redirectPath) {
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
      signal: AbortSignal.timeout(10_000),
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
      signal: AbortSignal.timeout(10_000),
    });

    if (!userRes.ok) {
      return NextResponse.redirect(new URL('/?error=fetch_user_failed', request.url));
    }

    const googleUser = await userRes.json();
    // googleUser: { id, email, name, picture, verified_email }

    if (!googleUser.email || !googleUser.verified_email) {
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
        access_token: null,
        refresh_token: null,
        id_token: null,
      },
      create: {
        userId: dbUser.id,
        type: 'oauth',
        provider: 'google',
        providerAccountId: googleUser.id,
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
