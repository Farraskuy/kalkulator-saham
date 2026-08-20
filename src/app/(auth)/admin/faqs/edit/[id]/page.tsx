"use client";

import { useEffect, useState } from "react";
import FaqEditorForm, {
  type FaqEditorData,
} from "@/features/admin/faqs/FaqEditorForm";
import { AdminEditorSkeleton } from "@/features/admin/components/AdminCrudUi";

export default function EditFaqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [faq, setFaq] = useState<FaqEditorData | null>(null);
  useEffect(() => {
    params.then(({ id }) =>
      fetch(`/api/faqs?id=${encodeURIComponent(id)}`)
        .then((response) => response.json())
        .then((data) => setFaq(data.faq || null)),
    );
  }, [params]);
  return faq ? (
    <FaqEditorForm mode="edit" initialData={faq} />
  ) : (
    <AdminEditorSkeleton label="Memuat FAQ..." />
  );
}
