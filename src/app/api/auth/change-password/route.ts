import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/password';

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Password lama dan password baru harus diisi.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 10) {
      return NextResponse.json(
        { error: 'Password baru minimal harus memiliki 10 karakter.' },
        { status: 400 }
      );
    }

    const user = await prisma.adminUser.findUnique({
      where: { email: session.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    if (!(await verifyPassword(oldPassword, user.passwordHash))) {
      return NextResponse.json({ error: 'Password lama yang Anda masukkan salah.' }, { status: 400 });
    }

    // Update password
    const newHash = await hashPassword(newPassword);
    await prisma.adminUser.update({
      where: { email: session.email },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ success: true, message: 'Password berhasil diperbarui!' });
  } catch {
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
