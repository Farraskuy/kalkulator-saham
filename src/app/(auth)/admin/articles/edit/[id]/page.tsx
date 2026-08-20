"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import ArticleEditorForm, {
  ArticleEditorData,
} from "@/features/admin/articles/ArticleEditorForm";
import { AdminEditorSkeleton } from "@/features/admin/components/AdminCrudUi";

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [article, setArticle] = useState<ArticleEditorData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/articles?id=${encodeURIComponent(id)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error || "Artikel gagal dimuat.");
        return data.article;
      })
      .then((data) => {
        if (!active) return;
        setArticle({
          id: data.id,
          title: data.title || "",
          slug: data.slug || "",
          category: data.category || "",
          type: data.type === "ARTICLE" ? "ARTICLE" : "BLOG",
          status: data.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
          excerpt: data.excerpt || "",
          content: data.content || "",
          coverImage: data.coverImage || "",
          author: data.author || "Tim Redaksi",
          isTraderPick: data.isTraderPick === true,
        });
      })
      .catch((fetchError) => {
        if (active)
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : "Artikel gagal dimuat.",
          );
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-rose-200 bg-card p-6 text-center dark:border-rose-900">
        <AlertCircle size={28} className="mx-auto text-rose-500" />
        <h1 className="mt-3 text-lg font-bold text-main">
          Artikel tidak dapat dibuka
        </h1>
        <p className="mt-1 text-sm text-muted">{error}</p>
        <Link
          href="/admin/articles"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-acc-blue px-4 py-2.5 text-sm font-semibold text-white"
        >
          <ArrowLeft size={16} /> Kembali ke daftar
        </Link>
      </div>
    );
  }

  if (!article) {
    return <AdminEditorSkeleton label="Memuat artikel..." />;
  }

  return <ArticleEditorForm mode="edit" initialData={article} />;
}
