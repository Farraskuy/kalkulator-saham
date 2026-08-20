"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Edit3, Eye, Trash2 } from "lucide-react";
import type { ArticleData } from "@/types";
import AdminDataTable, {
  type AdminTableColumn,
  type AdminTableFilter,
} from "@/features/admin/components/AdminDataTable";
import {
  AdminCrudError,
  AdminCrudHeader,
  AdminCrudLoading,
  AdminCrudPage,
  AdminDeleteDialog,
  deleteActionClass,
  iconActionClass,
} from "@/features/admin/components/AdminCrudUi";
import { useToast } from "@/components/ui/Toast";
import ToggleSwitch from "@/components/ui/ToggleSwitch";
import StatusBadge from "@/features/admin/components/StatusBadge";

type ManagedArticle = ArticleData & { createdAt: string; updatedAt: string };

export default function ManageArticlesPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<ManagedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ManagedArticle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/articles", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Daftar artikel gagal dimuat.");
      setItems(data.articles || []);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Daftar artikel gagal dimuat.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const toggleTraderPick = useCallback(
    async (item: ManagedArticle) => {
      const nextValue = !item.isTraderPick;
      setItems((current) =>
        current.map((article) =>
          article.id === item.id
            ? { ...article, isTraderPick: nextValue }
            : article,
        ),
      );
      try {
        const response = await fetch("/api/articles/toggle-pick", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id, isTraderPick: nextValue }),
        });
        const data = await response.json();
        if (!response.ok) {
          setItems((current) =>
            current.map((article) =>
              article.id === item.id
                ? { ...article, isTraderPick: item.isTraderPick }
                : article,
            ),
          );
          showToast(
            data.error || "Gagal memperbarui status Pilihan Teratas.",
            "error",
          );
        } else {
          showToast(
            nextValue
              ? `“${item.title}” berhasil ditambahkan ke Pilihan Teratas.`
              : `“${item.title}” dihapus dari Pilihan Teratas.`,
            "success",
          );
        }
      } catch {
        setItems((current) =>
          current.map((article) =>
            article.id === item.id
              ? { ...article, isTraderPick: item.isTraderPick }
              : article,
          ),
        );
        showToast(
          "Terjadi kesalahan jaringan saat memperbarui Pilihan Teratas.",
          "error",
        );
      }
    },
    [showToast],
  );

  const columns = useMemo<AdminTableColumn<ManagedArticle>[]>(
    () => [
      {
        id: "title",
        label: "Judul",
        getValue: (item) => item.title,
        render: (item) => (
          <div className="max-w-[320px]">
            <span className="block truncate font-bold text-main">
              {item.title}
            </span>
            <span className="block truncate text-xs text-muted">
              /{item.slug}
            </span>
          </div>
        ),
      },
      {
        id: "status",
        label: "Status",
        getValue: (item) => item.status,
        render: (item) => <StatusBadge status={item.status} />,
      },
      {
        id: "type",
        label: "Jenis",
        getValue: (item) => item.type,
        render: (item) => (
          <span className="text-xs font-semibold text-main">
            {item.type === "ARTICLE" ? "Artikel" : "Blog"}
          </span>
        ),
      },
      {
        id: "category",
        label: "Kategori",
        getValue: (item) => item.category,
        render: (item) => (
          <span className="text-xs font-semibold text-main">
            {item.category}
          </span>
        ),
      },
      {
        id: "isTraderPick",
        label: "Pilihan teratas",
        getValue: (item) => (item.isTraderPick ? "Ya" : "Tidak"),
        render: (item) => (
          <ToggleSwitch
            checked={item.isTraderPick}
            onChange={() => toggleTraderPick(item)}
            title={`Tandai ${item.title} sebagai pilihan teratas`}
          />
        ),
      },
      {
        id: "updatedAt",
        label: "Diperbarui",
        getValue: (item) => new Date(item.updatedAt),
        render: (item) => (
          <span className="text-xs font-semibold text-main">
            {new Date(item.updatedAt).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        ),
      },
    ],
    [toggleTraderPick],
  );

  const filters = useMemo<AdminTableFilter<ManagedArticle>[]>(
    () => [
      {
        id: "status",
        label: "Semua status",
        options: [
          { value: "PUBLISHED", label: "Published" },
          { value: "DRAFT", label: "Draft" },
        ],
        matches: (item: ManagedArticle, val: string) => item.status === val,
      },
      {
        id: "type",
        label: "Semua jenis",
        options: [
          { value: "ARTICLE", label: "Artikel" },
          { value: "BLOG", label: "Blog" },
        ],
        matches: (item: ManagedArticle, val: string) => item.type === val,
      },
    ],
    [],
  );

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(
        `/api/articles?id=${encodeURIComponent(deleteTarget.id)}`,
        { method: "DELETE" },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Artikel gagal dihapus.");
      setItems((current) =>
        current.filter((item) => item.id !== deleteTarget.id),
      );
      showToast(`Artikel “${deleteTarget.title}” berhasil dihapus.`, "success");
      setDeleteTarget(null);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Artikel gagal dihapus.",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminCrudPage>
      <AdminCrudHeader
        title="Artikel & Blog"
        description="Tulis, review, publikasikan, dan kelola seluruh konten website."
        actionHref="/admin/articles/new"
        actionLabel="Tambah artikel"
        icon={BookOpen}
      />
      {loading ? (
        <AdminCrudLoading label="Memuat daftar artikel..." />
      ) : loadError ? (
        <AdminCrudError message={loadError} onRetry={loadItems} />
      ) : (
        <AdminDataTable
          title="Daftar artikel & blog"
          description={`${items.length} konten tersimpan di CMS.`}
          items={items}
          columns={columns}
          filters={filters}
          getKey={(item) => item.id}
          searchFields={(item) => [
            item.title,
            item.slug,
            item.category,
            item.author || "",
          ]}
          searchPlaceholder="Cari judul, slug, kategori, atau penulis..."
          emptyText="Tidak ada artikel yang cocok."
          renderActions={(item) => (
            <>
              {item.status === "PUBLISHED" && (
                <Link
                  href={`/blog/${item.slug}`}
                  target="_blank"
                  className={iconActionClass}
                  title="Lihat publik"
                >
                  <Eye size={16} />
                </Link>
              )}
              <Link
                href={`/admin/articles/edit/${item.id}`}
                className={iconActionClass}
                title="Edit artikel"
              >
                <Edit3 size={16} />
              </Link>
              <button
                type="button"
                onClick={() => setDeleteTarget(item)}
                className={deleteActionClass}
                title="Hapus artikel"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        />
      )}
      {deleteTarget && (
        <AdminDeleteDialog
          title="Hapus artikel?"
          description={`“${deleteTarget.title}” akan dihapus permanen dan tidak lagi tersedia pada website.`}
          busy={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </AdminCrudPage>
  );
}
