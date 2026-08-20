import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { prisma } from "@/lib/db";
import { verifySession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get("id");
    if (id) {
      const category = await prisma.category.findUnique({ where: { id } });
      if (!category)
        return NextResponse.json(
          { error: "Kategori tidak ditemukan." },
          { status: 404 },
        );
      return NextResponse.json({ category });
    }
    const categories = await prisma.category.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengambil data kategori: " + (error as Error).message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, order } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Nama kategori wajib diisi" },
        { status: 400 },
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    const maxOrder = await prisma.category.aggregate({
      _max: { order: true },
    });
    const nextOrder =
      order !== undefined ? Number(order) : (maxOrder._max.order || 0) + 1;

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
        order: nextOrder,
      },
    });

    revalidateTag("categories", "max");

    return NextResponse.json({ success: true, category: newCategory });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat kategori: " + (error as Error).message },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, name, order } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: "ID dan nama kategori wajib diisi" },
        { status: 400 },
      );
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        order: order !== undefined ? Number(order) : 0,
      },
    });

    revalidateTag("categories", "max");

    return NextResponse.json({ success: true, category: updatedCategory });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal mengedit kategori: " + (error as Error).message },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  const session = await verifySession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID kategori wajib diisi" },
        { status: 400 },
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidateTag("categories", "max");

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal menghapus kategori: " + (error as Error).message },
      { status: 500 },
    );
  }
}
