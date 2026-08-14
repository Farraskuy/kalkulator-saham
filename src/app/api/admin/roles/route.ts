import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { DEFAULT_DYNAMIC_ROLES, DynamicRole, CMS_FEATURES, CMSFeature } from '@/lib/rbac';

export async function getDynamicRoles(): Promise<DynamicRole[]> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'dynamic_roles_config' },
    });
    if (setting?.value) {
      const parsed = JSON.parse(setting.value);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out legacy EDITOR and ANALYST defaults, ensuring CONTENT_MANAGER is present
        const filtered = parsed.filter((r: DynamicRole) => r.id !== 'ANALYST' && r.id !== 'EDITOR');
        const hasAdmin = filtered.some((r: DynamicRole) => r.id === 'ADMIN');
        const hasContentManager = filtered.some((r: DynamicRole) => r.id === 'CONTENT_MANAGER');
        const hasUser = filtered.some((r: DynamicRole) => r.id === 'USER');

        const result: DynamicRole[] = [];
        if (hasAdmin) {
          result.push(filtered.find((r: DynamicRole) => r.id === 'ADMIN')!);
        } else {
          result.push(DEFAULT_DYNAMIC_ROLES[0]);
        }

        if (hasContentManager) {
          result.push(filtered.find((r: DynamicRole) => r.id === 'CONTENT_MANAGER')!);
        } else {
          result.push(DEFAULT_DYNAMIC_ROLES[1]);
        }

        // Add custom roles
        filtered.forEach((r: DynamicRole) => {
          if (r.id !== 'ADMIN' && r.id !== 'CONTENT_MANAGER' && r.id !== 'USER') {
            result.push(r);
          }
        });

        // Add USER role at the end
        if (hasUser) {
          result.push(filtered.find((r: DynamicRole) => r.id === 'USER')!);
        } else {
          result.push(DEFAULT_DYNAMIC_ROLES[2]);
        }

        return result;
      }
    }
  } catch (error) {
    console.error('Failed to load dynamic roles, falling back to defaults:', error);
  }
  return DEFAULT_DYNAMIC_ROLES;
}

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const roles = await getDynamicRoles();
    return NextResponse.json({
      roles,
      availableFeatures: CMS_FEATURES,
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: 'Gagal mengambil data peran.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, description = '', permissions = [] } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Nama peran (role) wajib diisi.' }, { status: 400 });
    }

    const cleanName = name.trim();
    // Generate role ID (e.g. "Content Manager" -> "CONTENT_MANAGER")
    const roleId = cleanName.toUpperCase().replace(/[^A-Z0-9]/g, '_');

    const currentRoles = await getDynamicRoles();

    if (currentRoles.some((r) => r.id.toLowerCase() === roleId.toLowerCase() || r.name.toLowerCase() === cleanName.toLowerCase())) {
      return NextResponse.json({ error: 'Role dengan nama atau ID tersebut sudah ada.' }, { status: 400 });
    }

    const newRole: DynamicRole = {
      id: roleId,
      name: cleanName,
      description: description.trim(),
      isProtected: false,
      permissions: permissions as CMSFeature[],
      createdAt: new Date().toISOString(),
    };

    const updatedRoles = [...currentRoles, newRole];

    await prisma.systemSetting.upsert({
      where: { key: 'dynamic_roles_config' },
      update: { value: JSON.stringify(updatedRoles) },
      create: { key: 'dynamic_roles_config', value: JSON.stringify(updatedRoles) },
    });

    return NextResponse.json({
      success: true,
      message: `Peran baru "${cleanName}" berhasil dibuat.`,
      role: newRole,
      roles: updatedRoles,
    });
  } catch (error) {
    console.error('Error creating role:', error);
    return NextResponse.json({ error: 'Gagal membuat peran baru.' }, { status: 500 });
  }
}
