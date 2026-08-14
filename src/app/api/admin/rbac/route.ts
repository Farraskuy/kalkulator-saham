import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { DEFAULT_ROLE_PERMISSIONS, CMS_FEATURES } from '@/lib/rbac';

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let rolePermissions = DEFAULT_ROLE_PERMISSIONS;
    try {
      const rbacSetting = await prisma.systemSetting.findUnique({
        where: { key: 'rbac_permissions' },
      });
      if (rbacSetting?.value) {
        rolePermissions = { ...DEFAULT_ROLE_PERMISSIONS, ...JSON.parse(rbacSetting.value) };
      }
    } catch {
      // Use defaults
    }

    return NextResponse.json({
      rolePermissions,
      features: CMS_FEATURES,
    });
  } catch (error) {
    console.error('Error fetching RBAC permissions:', error);
    return NextResponse.json({ error: 'Gagal mengambil konfigurasi RBAC.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { rolePermissions } = await request.json();

    if (!rolePermissions || typeof rolePermissions !== 'object') {
      return NextResponse.json({ error: 'Data hak akses tidak valid.' }, { status: 400 });
    }

    // Ensure ADMIN always has all permissions
    const sanitizedPermissions = {
      ...rolePermissions,
      ADMIN: DEFAULT_ROLE_PERMISSIONS.ADMIN,
    };

    await prisma.systemSetting.upsert({
      where: { key: 'rbac_permissions' },
      update: { value: JSON.stringify(sanitizedPermissions) },
      create: {
        key: 'rbac_permissions',
        value: JSON.stringify(sanitizedPermissions),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Hak akses per-fitur berhasil diperbarui.',
      rolePermissions: sanitizedPermissions,
    });
  } catch (error) {
    console.error('Error updating RBAC permissions:', error);
    return NextResponse.json({ error: 'Gagal memperbarui konfigurasi RBAC.' }, { status: 500 });
  }
}
