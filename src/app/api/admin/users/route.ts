import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifySession } from '@/lib/auth';
import { hashPassword } from '@/lib/password';
import { CMS_FEATURES, DynamicRole } from '@/lib/rbac';
import { getDynamicRoles } from '@/app/api/admin/roles/route';

export async function GET() {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch dynamic roles from DB
    const dynamicRoles = await getDynamicRoles();

    // 2. Fetch AdminUser records
    const adminUsers = await prisma.adminUser.findMany({
      orderBy: { createdAt: 'asc' },
    });

    // 3. Fetch public User records (registered users via OAuth or system)
    const publicUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { histories: true },
        },
      },
    });

    // 4. Transform into unified User Management list
    const adminRoleObj = dynamicRoles.find((r) => r.id === 'ADMIN') || dynamicRoles[0];

    const unifiedUsers = [
      ...adminUsers.map((admin) => ({
        id: admin.id,
        email: admin.email,
        name: 'Administrator',
        role: 'ADMIN',
        accountType: 'ADMIN_CMS',
        isProtected: true, // Role Admin tidak dapat dihapus
        createdAt: admin.createdAt.toISOString(),
        calculationCount: 0,
        permissions: adminRoleObj.permissions,
      })),
      ...publicUsers
        .filter((user) => !adminUsers.some((a) => a.email.toLowerCase() === user.email.toLowerCase()))
        .map((user) => {
          const role = user.role || 'USER';
          const isProtected = role === 'ADMIN';
          const matchedRole = dynamicRoles.find((r) => r.id.toLowerCase() === role.toLowerCase());
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email.split('@')[0],
            role,
            accountType: 'USER_REGISTERED',
            isProtected,
            image: user.image,
            createdAt: user.createdAt.toISOString(),
            calculationCount: user._count.histories,
            permissions: matchedRole ? matchedRole.permissions : [],
          };
        }),
    ];

    return NextResponse.json({
      users: unifiedUsers,
      roles: dynamicRoles,
      availableFeatures: CMS_FEATURES,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Gagal mengambil data pengguna.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, email, password, role = 'EDITOR' } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists in AdminUser or User
    const [existingAdmin, existingUser] = await Promise.all([
      prisma.adminUser.findUnique({ where: { email: cleanEmail } }),
      prisma.user.findUnique({ where: { email: cleanEmail } }),
    ]);

    if (existingAdmin || existingUser) {
      return NextResponse.json({ error: 'Email sudah terdaftar di sistem.' }, { status: 400 });
    }

    if (role === 'ADMIN' || role === 'EDITOR' || role === 'ANALYST') {
      if (!password || password.length < 6) {
        return NextResponse.json({ error: 'Password minimal 6 karakter untuk staf CMS.' }, { status: 400 });
      }

      const passwordHash = await hashPassword(password);

      // Create AdminUser record for CMS login access
      const newAdmin = await prisma.adminUser.create({
        data: {
          email: cleanEmail,
          passwordHash,
        },
      });

      // Also create matching User entry for profile
      await prisma.user.create({
        data: {
          email: cleanEmail,
          name: name?.trim() || cleanEmail.split('@')[0],
          role: role === 'ADMIN' ? 'ADMIN' : 'USER',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Pengguna CMS dengan role ${role} berhasil ditambahkan.`,
        user: {
          id: newAdmin.id,
          email: newAdmin.email,
          role,
          isProtected: role === 'ADMIN',
        },
      });
    } else {
      // Regular public user registration
      const newUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: name?.trim() || cleanEmail.split('@')[0],
          role: 'USER',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Pengguna biasa berhasil didaftarkan.',
        user: {
          id: newUser.id,
          email: newUser.email,
          role: 'USER',
          isProtected: false,
        },
      });
    }
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Gagal membuat pengguna baru.' }, { status: 500 });
  }
}
