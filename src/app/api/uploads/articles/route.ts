import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

function isWebp(buffer: Buffer) {
  return (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

export async function POST(request: NextRequest) {
  const session = await verifySession();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File))
      return NextResponse.json(
        { error: "File gambar wajib dipilih." },
        { status: 400 },
      );
    if (file.type !== "image/webp")
      return NextResponse.json(
        { error: "Gambar harus dikompres ke format WebP." },
        { status: 400 },
      );
    if (file.size === 0 || file.size > MAX_UPLOAD_BYTES)
      return NextResponse.json(
        { error: "Ukuran gambar maksimal 2 MB setelah kompresi." },
        { status: 400 },
      );

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!isWebp(buffer))
      return NextResponse.json(
        { error: "Format file gambar tidak valid." },
        { status: 400 },
      );

    const uploadDirectory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "articles",
    );
    await mkdir(uploadDirectory, { recursive: true });
    const filename = `${Date.now()}-${randomUUID()}.webp`;
    await writeFile(path.join(uploadDirectory, filename), buffer, {
      flag: "wx",
    });

    return NextResponse.json({
      path: `/uploads/articles/${filename}`,
      size: buffer.length,
    });
  } catch (error) {
    console.error("Article cover upload failed:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan gambar sampul." },
      { status: 500 },
    );
  }
}
