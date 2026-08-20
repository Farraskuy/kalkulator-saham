import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { UserRole } from "@/lib/rbac";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { name, role, password } = await request.json();

    // Check if user exists in AdminUser or User
    const [adminTarget, userTarget] = await Promise.all([
      prisma.adminUser.findUnique({ where: { id } }),
      prisma.user.findUnique({ where: { id } }),
    ]);

    if (!adminTarget && !userTarget) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan." },
        { status: 404 },
      );
    }

    // Update password if provided
    let passwordHash: string | undefined;
    if (password && password.trim().length >= 6) {
      passwordHash = await hashPassword(password.trim());
    }

    if (adminTarget) {
      // If adminTarget is the primary admin account
      if (passwordHash) {
        await prisma.adminUser.update({
          where: { id: adminTarget.id },
          data: { passwordHash },
        });
      }

      // Update matching user record if exists
      const matchingUser = await prisma.user.findUnique({
        where: { email: adminTarget.email },
      });

      if (matchingUser) {
        await prisma.user.update({
          where: { id: matchingUser.id },
          data: {
            name: name || matchingUser.name,
            role: (role as UserRole) === "ADMIN" ? "ADMIN" : "USER",
          },
        });
      }
    } else if (userTarget) {
      const isUpgradingToAdmin = role === "ADMIN";

      await prisma.user.update({
        where: { id: userTarget.id },
        data: {
          name: name !== undefined ? name : userTarget.name,
          role: isUpgradingToAdmin ? "ADMIN" : "USER",
        },
      });

      // If password provided and upgrading or existing admin, ensure AdminUser entry
      if (passwordHash || isUpgradingToAdmin) {
        const existingAdmin = await prisma.adminUser.findUnique({
          where: { email: userTarget.email },
        });

        if (existingAdmin && passwordHash) {
          await prisma.adminUser.update({
            where: { id: existingAdmin.id },
            data: { passwordHash },
          });
        } else if (!existingAdmin && passwordHash) {
          await prisma.adminUser.create({
            data: {
              email: userTarget.email,
              passwordHash,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Data pengguna dan peran berhasil diperbarui.",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data pengguna." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Check if target is in AdminUser
    const adminTarget = await prisma.adminUser.findUnique({ where: { id } });
    if (adminTarget) {
      // PROTECTED: Role Admin tidak dapat dihapus
      return NextResponse.json(
        {
          error: "Role Admin terproteksi oleh sistem dan tidak dapat dihapus.",
        },
        { status: 403 },
      );
    }

    // Check if target is in User
    const userTarget = await prisma.user.findUnique({ where: { id } });
    if (!userTarget) {
      return NextResponse.json(
        { error: "Pengguna tidak ditemukan." },
        { status: 404 },
      );
    }

    // Check if user has ADMIN role
    if (userTarget.role === "ADMIN") {
      return NextResponse.json(
        {
          error: "Role Admin terproteksi oleh sistem dan tidak dapat dihapus.",
        },
        { status: 403 },
      );
    }

    // Delete user and associated accounts/histories
    await prisma.user.delete({
      where: { id: userTarget.id },
    });

    return NextResponse.json({
      success: true,
      message: `Pengguna ${userTarget.email} berhasil dihapus.`,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Gagal menghapus pengguna." },
      { status: 500 },
    );
  }
}
