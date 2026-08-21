"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import {
  Bold,
  Code2,
  Eye,
  FileText,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  LoaderCircle,
  Minus,
  Quote,
  RotateCcw,
  UploadCloud,
} from "lucide-react";
import {
  AdminCrudNotice,
  AdminEditorHeader,
  fieldClass,
} from "@/features/admin/components/AdminCrudUi";
import ArticleCoverUploader from "./ArticleCoverUploader";
import ToggleSwitch from "@/components/ui/ToggleSwitch";

export type ArticleEditorData = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  type: "ARTICLE" | "BLOG";
  status: "DRAFT" | "PUBLISHED";
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  isTraderPick: boolean;
};

type Props = {
  mode: "create" | "edit";
  initialData?: ArticleEditorData;
};

const EMPTY_ARTICLE: ArticleEditorData = {
  title: "",
  slug: "",
  category: "",
  type: "BLOG",
  status: "DRAFT",
  excerpt: "",
  content: "",
  coverImage: "",
  author: "Tim Redaksi",
  isTraderPick: false,
};

const MARKDOWN_TOOLS = [
  {
    label: "Heading 2",
    icon: Heading2,
    before: "## ",
    after: "",
    fallback: "Subjudul",
  },
  {
    label: "Heading 3",
    icon: Heading3,
    before: "### ",
    after: "",
    fallback: "Subbagian",
  },
  { label: "Bold", icon: Bold, before: "**", after: "**", fallback: "teks" },
  { label: "Italic", icon: Italic, before: "*", after: "*", fallback: "teks" },
  {
    label: "Daftar",
    icon: List,
    before: "- ",
    after: "",
    fallback: "Item daftar",
  },
  {
    label: "Bernomor",
    icon: ListOrdered,
    before: "1. ",
    after: "",
    fallback: "Langkah pertama",
  },
  {
    label: "Kutipan",
    icon: Quote,
    before: "> ",
    after: "",
    fallback: "Kutipan penting",
  },
  { label: "Kode", icon: Code2, before: "`", after: "`", fallback: "kode" },
  {
    label: "Tautan",
    icon: Link2,
    before: "[",
    after: "](https://)",
    fallback: "judul tautan",
  },
  {
    label: "Gambar",
    icon: ImageIcon,
    before: "![Deskripsi gambar](",
    after: ")",
    fallback: "https://...",
  },
  { label: "Pemisah", icon: Minus, before: "\n---\n", after: "", fallback: "" },
];

const ARTICLE_TEMPLATES = [
  {
    label: "Panduan",
    content: `## Ringkasan\n\nJelaskan inti pembahasan dan manfaat artikel bagi pembaca.\n\n## Langkah-langkah\n\n1. Langkah pertama\n2. Langkah kedua\n3. Langkah ketiga\n\n## Hal yang perlu diperhatikan\n\n- Risiko atau batasan yang perlu dipahami.\n- Sumber data yang digunakan.\n\n## Kesimpulan\n\nRangkum poin utama dan ajakan tindakan yang relevan.`,
  },
  {
    label: "Analisis",
    content: `## Ringkasan Analisis\n\nTulis konteks singkat kondisi pasar atau emiten.\n\n## Data dan Fakta\n\n- Data utama pertama\n- Data utama kedua\n\n## Analisis\n\nJelaskan interpretasi data secara objektif.\n\n> Catatan: Analisis bukan rekomendasi beli atau jual.\n\n## Risiko\n\nSebutkan risiko yang perlu dipertimbangkan pembaca.`,
  },
  {
    label: "Berita",
    content: `## Ringkasan Kejadian\n\nJelaskan apa yang terjadi, kapan, dan pihak yang terkait.\n\n## Detail Penting\n\nUraikan fakta utama secara berurutan.\n\n## Dampak bagi Investor\n\nJelaskan dampak potensial secara netral dan terukur.\n\n## Sumber\n\n[Tautan sumber](https://)`,
  },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

async function compressInlineImage(file: File) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () =>
        reject(new Error("File gambar tidak dapat dibuka."));
      element.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    let width = image.naturalWidth;
    let height = image.naturalHeight;
    const maxDimension = 1600;
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Browser tidak mendukung kompresi gambar.");
    context.drawImage(image, 0, 0, width, height);

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) =>
          blob ? resolve(blob) : reject(new Error("Gagal mengompres gambar.")),
        "image/webp",
        0.85,
      );
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export default function ArticleEditorForm({ mode, initialData }: Props) {
  const router = useRouter();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingInlineImage, setUploadingInlineImage] = useState(false);
  const [form, setForm] = useState<ArticleEditorData>(
    initialData ?? EMPTY_ARTICLE,
  );
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/categories")
      .then(async (response) => {
        if (!response.ok) throw new Error("Kategori gagal dimuat");
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        const nextCategories = data.categories || [];
        setCategories(nextCategories);
        if (nextCategories[0]) {
          setForm((current) =>
            current.category
              ? current
              : { ...current, category: nextCategories[0].name },
          );
        }
      })
      .catch(() => {
        if (active)
          setMessage({
            type: "error",
            text: "Kategori gagal dimuat. Periksa menu Kategori Artikel.",
          });
      });
    return () => {
      active = false;
    };
  }, []);

  const updateField = <K extends keyof ArticleEditorData>(
    key: K,
    value: ArticleEditorData[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage(null);
  };

  const handleTitleChange = (title: string) => {
    setForm((current) => ({
      ...current,
      title,
      slug: slugify(title),
    }));
  };

  const insertMarkdown = (before: string, after = "", fallback = "teks") => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = form.content.slice(start, end) || fallback;
    const nextContent = `${form.content.slice(0, start)}${before}${selected}${after}${form.content.slice(end)}`;
    updateField("content", nextContent);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selected.length,
      );
    });
  };

  const handleInlineImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage({
        type: "error",
        text: "Pilih file gambar berformat JPG, PNG, atau WebP.",
      });
      return;
    }

    setUploadingInlineImage(true);
    setMessage(null);
    try {
      const compressed = await compressInlineImage(file);
      const payload = new FormData();
      payload.append(
        "file",
        new File([compressed], "inline.webp", { type: "image/webp" }),
      );

      const response = await fetch("/api/uploads/articles", {
        method: "POST",
        body: payload,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Gagal mengunggah gambar.");
      }

      const altText = file.name.replace(/\.[^/.]+$/, "") || "Gambar artikel";
      insertMarkdown(`\n\n![${altText}](`, `${data.path})\n\n`, "");
      setMessage({
        type: "success",
        text: "Gambar berhasil diunggah ke Cloudinary dan disisipkan ke artikel!",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Gagal memproses unggahan gambar.",
      });
    } finally {
      setUploadingInlineImage(false);
    }
  };

  const applyTemplate = (content: string) => {
    if (
      form.content.trim() &&
      !window.confirm("Ganti isi editor dengan template ini?")
    )
      return;
    updateField("content", content);
    setActiveTab("write");
    requestAnimationFrame(() => contentRef.current?.focus());
  };

  const validate = () => {
    if (
      !form.title.trim() ||
      !form.category ||
      !form.excerpt.trim() ||
      !form.content.trim()
    ) {
      return "Lengkapi semua bidang yang ditandai wajib.";
    }
    if (form.excerpt.trim().length < 30 || form.excerpt.trim().length > 320) {
      return "Ringkasan harus berisi 30–320 karakter.";
    }
    if (form.content.trim().length < 50)
      return "Isi artikel minimal 50 karakter.";
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const payload = {
        ...form,
        slug: form.slug.trim() || slugify(form.title),
      };
      const response = await fetch("/api/articles", {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Artikel gagal disimpan.");
      setMessage({
        type: "success",
        text:
          form.status === "PUBLISHED"
            ? "Artikel berhasil dipublikasikan."
            : "Draft berhasil disimpan.",
      });
      router.push("/admin/articles?saved=1");
      router.refresh();
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Artikel gagal disimpan.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const wordCount = form.content.trim()
    ? form.content.trim().split(/\s+/).length
    : 0;
  const imageSource = form.coverImage.trim() || "/assets/images/img.png";

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-[1280px] space-y-5 pb-10"
    >
      <AdminEditorHeader
        backHref="/admin/articles"
        eyebrow="Konten / Artikel"
        title={mode === "create" ? "Tulis artikel baru" : "Edit artikel"}
        description="Tulis konten yang ringkas, terstruktur, dan mudah dibaca."
        actionLabel={
          form.status === "PUBLISHED" ? "Simpan & publikasikan" : "Simpan draft"
        }
        submitting={submitting}
        disabled={categories.length === 0}
      />

      {message && (
        <AdminCrudNotice type={message.type}>{message.text}</AdminCrudNotice>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-border-custom bg-card">
            <div className="border-b border-border-custom px-5 py-4 sm:px-6">
              <h2 className="text-sm font-bold text-main">Informasi utama</h2>
              <p className="mt-0.5 text-xs text-muted">
                Judul dan ringkasan yang terlihat pada daftar artikel.
              </p>
            </div>
            <div className="space-y-5 p-5 sm:p-6">
              <div className="space-y-1.5">
                <label
                  htmlFor="article-title"
                  className="text-sm font-semibold text-main"
                >
                  Judul <span className="text-rose-500">*</span>
                </label>
                <input
                  id="article-title"
                  value={form.title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  className={fieldClass}
                  maxLength={160}
                  placeholder="Contoh: Cara Menghitung Average Down dengan Aman"
                  autoFocus={mode === "create"}
                />
                <div className="flex justify-end text-[11px] text-muted">
                  {form.title.length}/160
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="article-excerpt"
                  className="text-sm font-semibold text-main"
                >
                  Ringkasan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="article-excerpt"
                  value={form.excerpt}
                  onChange={(event) =>
                    updateField("excerpt", event.target.value)
                  }
                  className={`${fieldClass} min-h-24 resize-y`}
                  maxLength={320}
                  placeholder="Jelaskan manfaat utama artikel dalam 1–2 kalimat."
                />
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span>Ideal 120–180 karakter.</span>
                  <span>{form.excerpt.length}/320</span>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-border-custom bg-card">
            <div className="flex flex-col gap-3 border-b border-border-custom px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <div>
                <h2 className="text-sm font-bold text-main">
                  Isi artikel <span className="text-rose-500">*</span>
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  Gunakan template dan Markdown untuk menyusun artikel yang rapi
                  dan mudah dibaca.
                </p>
              </div>
              <div className="inline-flex w-fit rounded-lg bg-sub-slate p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("write")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold ${activeTab === "write" ? "bg-card text-main" : "text-muted"}`}
                >
                  Tulis
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${activeTab === "preview" ? "bg-card text-main" : "text-muted"}`}
                >
                  <Eye size={13} /> Preview
                </button>
              </div>
            </div>

            {activeTab === "write" ? (
              <>
                <div className="flex flex-wrap items-center gap-1 border-b border-border-custom bg-card px-3 py-2">
                  <span className="mr-1 px-1.5 text-[11px] font-semibold text-muted">
                    Mulai dari:
                  </span>
                  {ARTICLE_TEMPLATES.map((template) => (
                    <button
                      key={template.label}
                      type="button"
                      onClick={() => applyTemplate(template.content)}
                      className="h-7 rounded-md border border-border-custom px-2.5 text-xs font-semibold text-muted transition-colors hover:border-acc-blue/40 hover:bg-sub-blue hover:text-acc-blue"
                    >
                      Template {template.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center gap-1 border-b border-border-custom bg-sub-slate/60 px-3 py-2">
                  <input
                    ref={inlineImageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleInlineImageUpload}
                  />
                  <button
                    type="button"
                    disabled={uploadingInlineImage}
                    onClick={() => inlineImageInputRef.current?.click()}
                    className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-acc-blue/30 bg-sub-blue px-2.5 text-xs font-semibold text-acc-blue transition-colors hover:bg-acc-blue hover:text-white disabled:cursor-wait disabled:opacity-60 mr-1"
                    title="Upload gambar langsung ke Cloudinary dan sisipkan ke artikel"
                  >
                    {uploadingInlineImage ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      <UploadCloud size={14} />
                    )}
                    <span>{uploadingInlineImage ? "Mengunggah..." : "Upload Gambar (Cloudinary)"}</span>
                  </button>
                  {MARKDOWN_TOOLS.map(
                    ({ label, icon: Icon, before, after, fallback }) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => insertMarkdown(before, after, fallback)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-muted hover:bg-card hover:text-main"
                        title={label}
                      >
                        <Icon size={14} />{" "}
                        <span className="hidden sm:inline">{label}</span>
                      </button>
                    ),
                  )}
                </div>
                <textarea
                  ref={contentRef}
                  value={form.content}
                  onChange={(event) =>
                    updateField("content", event.target.value)
                  }
                  className="min-h-[440px] w-full resize-y bg-card p-5 font-mono text-[13px] leading-6 text-main outline-none sm:p-6"
                  placeholder={
                    "Mulai menulis artikel...\n\n## Subjudul\n\nIsi paragraf artikel."
                  }
                  spellCheck
                />
                <div className="border-t border-border-custom bg-sub-slate/35 px-5 py-2.5 text-[11px] leading-5 text-muted">
                  Tip: Anda bisa mengklik tombol <strong>Upload Gambar (Cloudinary)</strong> untuk langsung mengunggah foto ke Cloudinary dan menempelkannya ke isi artikel.
                </div>
              </>
            ) : (
              <article className="min-h-[440px] p-5 text-base leading-relaxed text-main sm:p-7 space-y-4">
                {form.content.trim() ? (
                  <ReactMarkdown
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-2xl font-bold text-main mt-6 mb-3 tracking-tight">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-xl font-bold text-main mt-6 mb-2 tracking-tight border-b border-border-custom pb-2">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-lg font-bold text-main mt-4 mb-2 tracking-tight">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-sm leading-relaxed text-main mb-3 last:mb-0">
                          {children}
                        </p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-6 space-y-1.5 mb-3 text-sm text-main marker:text-acc-blue">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-6 space-y-1.5 mb-3 text-sm text-main marker:text-acc-blue">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed pl-1">{children}</li>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-acc-blue bg-sub-slate/50 rounded-r-xl p-4 my-3 italic text-sm text-muted">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children }) => (
                        <code className="bg-sub-slate px-1.5 py-0.5 rounded text-xs font-mono text-acc-blue">
                          {children}
                        </code>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-acc-blue font-semibold hover:underline"
                        >
                          {children}
                        </a>
                      ),
                      hr: () => <hr className="my-6 border-border-custom" />,
                      img: ({ src, alt }) => (
                        <span className="block my-4 overflow-hidden rounded-xl border border-border-custom bg-sub-slate/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt={alt || "Gambar artikel"}
                            className="w-full max-h-[400px] object-cover rounded-xl"
                            loading="lazy"
                          />
                          {alt && (
                            <span className="block text-center text-xs text-muted py-1.5">
                              {alt}
                            </span>
                          )}
                        </span>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-bold text-main">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                    }}
                  >
                    {form.content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-muted text-sm">Belum ada isi untuk dipreview.</p>
                )}
              </article>
            )}
            <div className="flex items-center justify-between border-t border-border-custom px-5 py-3 text-xs text-muted">
              <span>{wordCount} kata</span>
              <span>
                {form.content.length.toLocaleString("id-ID")} karakter
              </span>
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-5">
          <section className="rounded-2xl border border-border-custom bg-card">
            <div className="border-b border-border-custom px-5 py-4">
              <h2 className="text-sm font-bold text-main">Publikasi</h2>
            </div>
            <div className="space-y-4 p-5">
              <div className="space-y-1.5">
                <label
                  htmlFor="article-status"
                  className="text-xs font-semibold text-main"
                >
                  Status
                </label>
                <select
                  id="article-status"
                  value={form.status}
                  onChange={(event) =>
                    updateField(
                      "status",
                      event.target.value as ArticleEditorData["status"],
                    )
                  }
                  className={fieldClass}
                >
                  <option value="DRAFT">Draft — belum tampil publik</option>
                  <option value="PUBLISHED">Published — tampil publik</option>
                </select>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-main">
                  Jenis konten
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(["BLOG", "ARTICLE"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateField("type", type)}
                      className={`rounded-xl border px-3 py-2.5 text-xs font-semibold ${
                        form.type === type
                          ? "border-acc-blue bg-sub-blue text-acc-blue"
                          : "border-border-custom bg-card text-muted hover:text-main"
                      }`}
                    >
                      {type === "BLOG" ? "Blog" : "Artikel"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="article-category"
                  className="text-xs font-semibold text-main"
                >
                  Kategori <span className="text-rose-500">*</span>
                </label>
                <select
                  id="article-category"
                  value={form.category}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  className={fieldClass}
                >
                  <option value="" disabled>
                    Pilih kategori
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="article-author"
                  className="text-xs font-semibold text-main"
                >
                  Penulis
                </label>
                <input
                  id="article-author"
                  value={form.author}
                  onChange={(event) =>
                    updateField("author", event.target.value)
                  }
                  className={fieldClass}
                  maxLength={100}
                  placeholder="Tim Redaksi"
                />
              </div>

              <div className="pt-2 border-t border-border-custom">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-semibold text-main">
                      Pilihan teratas
                    </span>
                    <span className="block text-[11px] leading-4 text-muted">
                      Maksimal 3 artikel. Hanya artikel published yang akan
                      tampil pada sidebar blog.
                    </span>
                  </div>
                  <ToggleSwitch
                    checked={form.isTraderPick}
                    onChange={(checked) => updateField("isTraderPick", checked)}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-border-custom bg-card">
            <div className="border-b border-border-custom px-5 py-4">
              <h2 className="text-sm font-bold text-main">Gambar sampul</h2>
              <p className="mt-0.5 text-xs text-muted">
                Gunakan rasio 16:9 agar kartu artikel konsisten.
              </p>
            </div>
            <div className="space-y-4 p-5">
              <div className="relative aspect-video overflow-hidden rounded-xl border border-border-custom bg-sub-slate">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageSource}
                  alt="Preview gambar sampul"
                  className="h-full w-full object-cover"
                />
                {!form.coverImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
                    <div className="flex items-center gap-2 rounded-lg bg-black/55 px-3 py-2 text-xs font-semibold">
                      <ImageIcon size={15} /> Gambar bawaan
                    </div>
                  </div>
                )}
              </div>
              <ArticleCoverUploader
                value={form.coverImage}
                onChange={(coverImage) => updateField("coverImage", coverImage)}
              />
            </div>
          </section>

          <div className="rounded-2xl border border-border-custom bg-sub-slate/50 p-4 text-xs leading-5 text-muted">
            <div className="mb-1.5 flex items-center gap-2 font-semibold text-main">
              <FileText size={15} /> Checklist sebelum terbit
            </div>
            Pastikan judul jelas, ringkasan tidak terpotong, gambar dapat
            dibuka, dan preview Markdown sudah rapi.
          </div>
        </aside>
      </div>
    </form>
  );
}
