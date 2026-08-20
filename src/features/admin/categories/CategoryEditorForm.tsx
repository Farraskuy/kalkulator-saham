"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AdminCrudNotice,
  AdminEditorHeader,
  fieldClass,
} from "@/features/admin/components/AdminCrudUi";

export type CategoryEditorData = {
  id?: string;
  name: string;
  slug: string;
  order: number;
};
const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export default function CategoryEditorForm({
  mode,
  initialData,
}: {
  mode: "create" | "edit";
  initialData?: CategoryEditorData;
}) {
  const router = useRouter();
  const [form, setForm] = useState<CategoryEditorData>(
    initialData || { name: "", slug: "", order: 1 },
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    const slug = slugify(form.name);
    if (!form.name.trim()) return setError("Nama kategori wajib diisi.");
    setSubmitting(true);
    try {
      const response = await fetch("/api/categories", {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, slug }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Kategori gagal disimpan.");
      router.push("/admin/categories");
      router.refresh();
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Kategori gagal disimpan.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={save} className="mx-auto max-w-5xl space-y-5 pb-10">
      <AdminEditorHeader
        backHref="/admin/categories"
        eyebrow="Konten / Kategori"
        title={mode === "create" ? "Tambah kategori" : "Edit kategori"}
        description="Nama dan urutan kategori artikel."
        actionLabel="Simpan kategori"
        submitting={submitting}
      />
      {error && <AdminCrudNotice type="error">{error}</AdminCrudNotice>}
      <section className="space-y-5 rounded-2xl border border-border-custom bg-card p-5 sm:p-6">
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-main">
            Nama kategori *
          </span>
          <input
            autoFocus
            value={form.name}
            onChange={(event) => {
              const name = event.target.value;
              setForm((current) => ({ ...current, name, slug: slugify(name) }));
            }}
            className={fieldClass}
            placeholder="Contoh: Edukasi Saham"
          />
        </label>
        <label className="block max-w-48 space-y-1.5">
          <span className="text-sm font-semibold text-main">Urutan tampil</span>
          <input
            type="number"
            min={1}
            value={form.order}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                order: Number(event.target.value) || 1,
              }))
            }
            className={fieldClass}
          />
        </label>
      </section>
    </form>
  );
}
