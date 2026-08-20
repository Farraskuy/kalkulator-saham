import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/auth";
import {
  DEFAULT_DYNAMIC_ROLES,
  DynamicRole,
  CMSFeature,
  CMS_FEATURES,
} from "@/lib/rbac";
import { getDynamicRoles } from "../route";

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
    const { name, description, permissions } = await request.json();

    const currentRoles = await getDynamicRoles();
    const roleIndex = currentRoles.findIndex(
      (r) => r.id.toLowerCase() === id.toLowerCase(),
    );

    if (roleIndex === -1) {
      return NextResponse.json(
        { error: "Peran (role) tidak ditemukan." },
        { status: 404 },
      );
    }

    const targetRole = currentRoles[roleIndex];
    const isAdmin = targetRole.id === "ADMIN" || targetRole.isProtected;

    const updatedRole: DynamicRole = {
      ...targetRole,
      name: name?.trim() || targetRole.name,
      description:
        description !== undefined ? description.trim() : targetRole.description,
      isProtected: isAdmin ? true : targetRole.isProtected,
      permissions: isAdmin
        ? CMS_FEATURES.map((f) => f.id)
        : (permissions as CMSFeature[]) || targetRole.permissions,
    };

    const updatedRoles = [...currentRoles];
    updatedRoles[roleIndex] = updatedRole;

    await prisma.systemSetting.upsert({
      where: { key: "dynamic_roles_config" },
      update: { value: JSON.stringify(updatedRoles) },
      create: {
        key: "dynamic_roles_config",
        value: JSON.stringify(updatedRoles),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Peran "${updatedRole.name}" berhasil diperbarui.`,
      role: updatedRole,
      roles: updatedRoles,
    });
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data peran." },
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
    const currentRoles = await getDynamicRoles();
    const targetRole = currentRoles.find(
      (r) => r.id.toLowerCase() === id.toLowerCase(),
    );

    if (!targetRole) {
      return NextResponse.json(
        { error: "Peran (role) tidak ditemukan." },
        { status: 404 },
      );
    }

    // PROTECTED: ADMIN CANNOT BE DELETED
    if (targetRole.id === "ADMIN" || targetRole.isProtected) {
      return NextResponse.json(
        {
          error: "Role Admin terproteksi oleh sistem dan tidak dapat dihapus.",
        },
        { status: 403 },
      );
    }

    const updatedRoles = currentRoles.filter(
      (r) => r.id.toLowerCase() !== id.toLowerCase(),
    );

    await prisma.systemSetting.upsert({
      where: { key: "dynamic_roles_config" },
      update: { value: JSON.stringify(updatedRoles) },
      create: {
        key: "dynamic_roles_config",
        value: JSON.stringify(updatedRoles),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Peran "${targetRole.name}" berhasil dihapus.`,
      roles: updatedRoles,
    });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { error: "Gagal menghapus peran." },
      { status: 500 },
    );
  }
}
