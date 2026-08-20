"use client";

import { useEffect, useState } from "react";
import CategoryEditorForm, {
  type CategoryEditorData,
} from "@/features/admin/categories/CategoryEditorForm";
import { AdminEditorSkeleton } from "@/features/admin/components/AdminCrudUi";

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [item, setItem] = useState<CategoryEditorData | null>(null);
  useEffect(() => {
    params.then(({ id }) =>
      fetch(`/api/categories?id=${encodeURIComponent(id)}`)
        .then((response) => response.json())
        .then((data) => setItem(data.category || null)),
    );
  }, [params]);
  return item ? (
    <CategoryEditorForm mode="edit" initialData={item} />
  ) : (
    <AdminEditorSkeleton label="Memuat kategori..." />
  );
}
