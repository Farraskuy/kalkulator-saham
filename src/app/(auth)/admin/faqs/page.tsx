"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Edit3, HelpCircle, Trash2 } from "lucide-react";
import AdminDataTable, {
  type AdminTableColumn,
} from "@/features/admin/components/AdminDataTable";
import {
  AdminCrudError,
  AdminCrudHeader,
  AdminCrudLoading,
  AdminCrudNotice,
  AdminCrudPage,
  AdminDeleteDialog,
  deleteActionClass,
  iconActionClass,
} from "@/features/admin/components/AdminCrudUi";

type FaqItem = {
  id: string;
  slug: string;
  question: string;
  answer: string;
  order: number;
};

export default function AdminFaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FaqItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const loadItems = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await fetch("/api/faqs");
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Daftar FAQ gagal dimuat.");
      setItems(data.faqs || []);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Daftar FAQ gagal dimuat.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadItems();
  }, [loadItems]);
  const columns = useMemo<AdminTableColumn<FaqItem>[]>(
    () => [
      {
        id: "order",
        label: "Urutan",
        getValue: (item) => item.order,
        render: (item) => (
          <span className="font-semibold text-acc-blue">#{item.order}</span>
        ),
        className: "w-24",
      },
      {
        id: "question",
        label: "Pertanyaan",
        getValue: (item) => item.question,
        render: (item) => (
          <span className="block max-w-lg font-semibold text-main">
            {item.question}
          </span>
        ),
      },
      {
        id: "answer",
        label: "Jawaban",
        getValue: (item) => item.answer,
        render: (item) => (
          <span className="block max-w-sm truncate text-muted">
            {item.answer}
          </span>
        ),
      },
    ],
    [],
  );
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(
        `/api/faqs?id=${encodeURIComponent(deleteTarget.id)}`,
        { method: "DELETE" },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "FAQ gagal dihapus.");
      setItems((current) =>
        current.filter((item) => item.id !== deleteTarget.id),
      );
      setNotice({
        type: "success",
        text: `FAQ “${deleteTarget.question}” berhasil dihapus.`,
      });
      setDeleteTarget(null);
    } catch (error) {
      setNotice({
        type: "error",
        text: error instanceof Error ? error.message : "FAQ gagal dihapus.",
      });
    } finally {
      setDeleting(false);
    }
  };
  return (
    <AdminCrudPage>
      <AdminCrudHeader
        title="FAQ"
        description="Kelola pertanyaan, jawaban Markdown, slug, dan urutan tampil."
        actionHref="/admin/faqs/new"
        actionLabel="Tambah FAQ"
        icon={HelpCircle}
      />
      {notice && (
        <AdminCrudNotice type={notice.type} onClose={() => setNotice(null)}>
          {notice.text}
        </AdminCrudNotice>
      )}
      {loading ? (
        <AdminCrudLoading label="Memuat daftar FAQ..." />
      ) : loadError ? (
        <AdminCrudError message={loadError} onRetry={loadItems} />
      ) : (
        <AdminDataTable
          title="Daftar FAQ"
          description={`${items.length} pertanyaan tersimpan di CMS.`}
          items={items}
          columns={columns}
          getKey={(item) => item.id}
          searchFields={(item) => [item.question, item.answer, item.slug]}
          searchPlaceholder="Cari pertanyaan, jawaban, atau slug..."
          emptyText="Tidak ada FAQ yang cocok."
          renderActions={(item) => (
            <>
              <Link
                href={`/admin/faqs/edit/${item.id}`}
                className={iconActionClass}
                title="Edit FAQ"
              >
                <Edit3 size={16} />
              </Link>
              <button
                type="button"
                onClick={() => setDeleteTarget(item)}
                className={deleteActionClass}
                title="Hapus FAQ"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
        />
      )}
      {deleteTarget && (
        <AdminDeleteDialog
          title="Hapus FAQ?"
          description={`“${deleteTarget.question}” akan dihapus permanen dari website.`}
          busy={deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </AdminCrudPage>
  );
}
