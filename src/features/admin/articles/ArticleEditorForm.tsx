'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft,
  Bold,
  CheckCircle2,
  Eye,
  FileText,
  Heading2,
  ImageIcon,
  Italic,
  Link2,
  List,
  LoaderCircle,
  RotateCcw,
  Save,
} from 'lucide-react';

export type ArticleEditorData = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  type: 'ARTICLE' | 'BLOG';
  status: 'DRAFT' | 'PUBLISHED';
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
};

type Props = {
  mode: 'create' | 'edit';
  initialData?: ArticleEditorData;
};

const EMPTY_ARTICLE: ArticleEditorData = {
  title: '',
  slug: '',
  category: '',
  type: 'BLOG',
  status: 'DRAFT',
  excerpt: '',
  content: '',
  coverImage: '',
  author: 'Tim Redaksi',
};

const fieldClass =
  'w-full rounded-xl border border-border-custom bg-card px-3.5 py-2.5 text-sm text-main outline-none transition-colors placeholder:text-muted/70 focus:border-acc-blue focus:ring-2 focus:ring-acc-blue/10';

const MARKDOWN_TOOLS = [
  { label: 'Heading', icon: Heading2, before: '## ', after: '', fallback: 'Subjudul' },
  { label: 'Bold', icon: Bold, before: '**', after: '**', fallback: 'teks' },
  { label: 'Italic', icon: Italic, before: '*', after: '*', fallback: 'teks' },
  { label: 'Daftar', icon: List, before: '- ', after: '', fallback: 'Item daftar' },
  { label: 'Tautan', icon: Link2, before: '[', after: '](https://)', fallback: 'judul tautan' },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export default function ArticleEditorForm({ mode, initialData }: Props) {
  const router = useRouter();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [form, setForm] = useState<ArticleEditorData>(initialData ?? EMPTY_ARTICLE);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [slugEdited, setSlugEdited] = useState(mode === 'edit');
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/categories')
      .then(async (response) => {
        if (!response.ok) throw new Error('Kategori gagal dimuat');
        return response.json();
      })
      .then((data) => {
        if (!active) return;
        const nextCategories = data.categories || [];
        setCategories(nextCategories);
        if (nextCategories[0]) {
          setForm((current) => current.category ? current : { ...current, category: nextCategories[0].name });
        }
      })
      .catch(() => {
        if (active) setMessage({ type: 'error', text: 'Kategori gagal dimuat. Periksa menu Kategori Artikel.' });
      });
    return () => {
      active = false;
    };
  }, []);

  const updateField = <K extends keyof ArticleEditorData>(key: K, value: ArticleEditorData[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage(null);
  };

  const handleTitleChange = (title: string) => {
    setForm((current) => ({
      ...current,
      title,
      slug: slugEdited ? current.slug : slugify(title),
    }));
  };

  const insertMarkdown = (before: string, after = '', fallback = 'teks') => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = form.content.slice(start, end) || fallback;
    const nextContent = `${form.content.slice(0, start)}${before}${selected}${after}${form.content.slice(end)}`;
    updateField('content', nextContent);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  };

  const validate = () => {
    if (!form.title.trim() || !form.slug.trim() || !form.category || !form.excerpt.trim() || !form.content.trim()) {
      return 'Lengkapi semua bidang yang ditandai wajib.';
    }
    if (form.excerpt.trim().length < 30 || form.excerpt.trim().length > 320) {
      return 'Ringkasan harus berisi 30–320 karakter.';
    }
    if (form.content.trim().length < 50) return 'Isi artikel minimal 50 karakter.';
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    setSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch('/api/articles', {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Artikel gagal disimpan.');
      setMessage({ type: 'success', text: form.status === 'PUBLISHED' ? 'Artikel berhasil dipublikasikan.' : 'Draft berhasil disimpan.' });
      router.push('/admin/articles?saved=1');
      router.refresh();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Artikel gagal disimpan.' });
    } finally {
      setSubmitting(false);
    }
  };

  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;
  const imageSource = form.coverImage.trim() || '/assets/images/img.png';

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-[1280px] space-y-5 pb-10">
      <div className="flex flex-col gap-4 border-b border-border-custom pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/admin/articles"
            className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border-custom bg-card text-muted hover:border-acc-blue/40 hover:text-acc-blue"
            aria-label="Kembali ke daftar artikel"
          >
            <ArrowLeft size={17} />
          </Link>
          <div>
            <p className="text-xs font-semibold text-acc-blue">Konten / Artikel</p>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight text-main sm:text-2xl">
              {mode === 'create' ? 'Tulis artikel baru' : 'Edit artikel'}
            </h1>
            <p className="mt-1 text-sm text-muted">Tulis konten yang ringkas, terstruktur, dan mudah dibaca.</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting || categories.length === 0}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-acc-blue px-5 text-sm font-semibold text-white transition-colors hover:bg-acc-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}
          {submitting ? 'Menyimpan...' : form.status === 'PUBLISHED' ? 'Simpan & publikasikan' : 'Simpan draft'}
        </button>
      </div>

      {message && (
        <div
          className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40'
              : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40'
          }`}
          role="alert"
        >
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-border-custom bg-card">
            <div className="border-b border-border-custom px-5 py-4 sm:px-6">
              <h2 className="text-sm font-bold text-main">Informasi utama</h2>
              <p className="mt-0.5 text-xs text-muted">Judul, URL, dan ringkasan yang terlihat pada daftar artikel.</p>
            </div>
            <div className="space-y-5 p-5 sm:p-6">
              <div className="space-y-1.5">
                <label htmlFor="article-title" className="text-sm font-semibold text-main">
                  Judul <span className="text-rose-500">*</span>
                </label>
                <input
                  id="article-title"
                  value={form.title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  className={fieldClass}
                  maxLength={160}
                  placeholder="Contoh: Cara Menghitung Average Down dengan Aman"
                  autoFocus={mode === 'create'}
                />
                <div className="flex justify-end text-[11px] text-muted">{form.title.length}/160</div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="article-slug" className="text-sm font-semibold text-main">
                    Slug URL <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setSlugEdited(false);
                      updateField('slug', slugify(form.title));
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-acc-blue hover:underline"
                  >
                    <RotateCcw size={12} /> Buat ulang
                  </button>
                </div>
                <div className="flex overflow-hidden rounded-xl border border-border-custom bg-card focus-within:border-acc-blue focus-within:ring-2 focus-within:ring-acc-blue/10">
                  <span className="hidden items-center border-r border-border-custom bg-sub-slate px-3 text-xs text-muted sm:flex">/blog/</span>
                  <input
                    id="article-slug"
                    value={form.slug}
                    onChange={(event) => {
                      setSlugEdited(true);
                      updateField('slug', slugify(event.target.value));
                    }}
                    className="min-w-0 grow bg-transparent px-3.5 py-2.5 text-sm text-main outline-none"
                    maxLength={180}
                    placeholder="judul-artikel"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="article-excerpt" className="text-sm font-semibold text-main">
                  Ringkasan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  id="article-excerpt"
                  value={form.excerpt}
                  onChange={(event) => updateField('excerpt', event.target.value)}
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
                <h2 className="text-sm font-bold text-main">Isi artikel <span className="text-rose-500">*</span></h2>
                <p className="mt-0.5 text-xs text-muted">Gunakan Markdown untuk heading, daftar, tautan, dan penekanan.</p>
              </div>
              <div className="inline-flex w-fit rounded-lg bg-sub-slate p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('write')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold ${activeTab === 'write' ? 'bg-card text-main' : 'text-muted'}`}
                >
                  Tulis
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold ${activeTab === 'preview' ? 'bg-card text-main' : 'text-muted'}`}
                >
                  <Eye size={13} /> Preview
                </button>
              </div>
            </div>

            {activeTab === 'write' ? (
              <>
                <div className="flex flex-wrap gap-1 border-b border-border-custom bg-sub-slate/60 px-3 py-2">
                  {MARKDOWN_TOOLS.map(({ label, icon: Icon, before, after, fallback }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => insertMarkdown(before, after, fallback)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-muted hover:bg-card hover:text-main"
                      title={label}
                    >
                      <Icon size={14} /> <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>
                <textarea
                  ref={contentRef}
                  value={form.content}
                  onChange={(event) => updateField('content', event.target.value)}
                  className="min-h-[440px] w-full resize-y bg-card p-5 font-mono text-[13px] leading-6 text-main outline-none sm:p-6"
                  placeholder={'Mulai menulis artikel...\n\n## Subjudul\n\nIsi paragraf artikel.'}
                  spellCheck
                />
              </>
            ) : (
              <article className="min-h-[440px] p-5 text-sm leading-7 text-main sm:p-7 [&_a]:text-acc-blue [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-acc-blue/30 [&_blockquote]:pl-4 [&_h1]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:mb-3 [&_h2]:mt-7 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:text-lg [&_h3]:font-bold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-4 [&_ul]:list-disc">
                {form.content.trim() ? <ReactMarkdown>{form.content}</ReactMarkdown> : <p className="text-muted">Belum ada isi untuk dipreview.</p>}
              </article>
            )}
            <div className="flex items-center justify-between border-t border-border-custom px-5 py-3 text-xs text-muted">
              <span>{wordCount} kata</span>
              <span>{form.content.length.toLocaleString('id-ID')} karakter</span>
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
                <label htmlFor="article-status" className="text-xs font-semibold text-main">Status</label>
                <select
                  id="article-status"
                  value={form.status}
                  onChange={(event) => updateField('status', event.target.value as ArticleEditorData['status'])}
                  className={fieldClass}
                >
                  <option value="DRAFT">Draft — belum tampil publik</option>
                  <option value="PUBLISHED">Published — tampil publik</option>
                </select>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-semibold text-main">Jenis konten</span>
                <div className="grid grid-cols-2 gap-2">
                  {(['BLOG', 'ARTICLE'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => updateField('type', type)}
                      className={`rounded-xl border px-3 py-2.5 text-xs font-semibold ${
                        form.type === type
                          ? 'border-acc-blue bg-sub-blue text-acc-blue'
                          : 'border-border-custom bg-card text-muted hover:text-main'
                      }`}
                    >
                      {type === 'BLOG' ? 'Blog' : 'Artikel'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="article-category" className="text-xs font-semibold text-main">Kategori <span className="text-rose-500">*</span></label>
                <select
                  id="article-category"
                  value={form.category}
                  onChange={(event) => updateField('category', event.target.value)}
                  className={fieldClass}
                >
                  <option value="" disabled>Pilih kategori</option>
                  {categories.map((category) => <option key={category.id} value={category.name}>{category.name}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="article-author" className="text-xs font-semibold text-main">Penulis</label>
                <input
                  id="article-author"
                  value={form.author}
                  onChange={(event) => updateField('author', event.target.value)}
                  className={fieldClass}
                  maxLength={100}
                  placeholder="Tim Redaksi"
                />
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-border-custom bg-card">
            <div className="border-b border-border-custom px-5 py-4">
              <h2 className="text-sm font-bold text-main">Gambar sampul</h2>
              <p className="mt-0.5 text-xs text-muted">Gunakan rasio 16:9 agar kartu artikel konsisten.</p>
            </div>
            <div className="space-y-4 p-5">
              <div className="relative aspect-video overflow-hidden rounded-xl border border-border-custom bg-sub-slate">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageSource} alt="Preview gambar sampul" className="h-full w-full object-cover" />
                {!form.coverImage && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white">
                    <div className="flex items-center gap-2 rounded-lg bg-black/55 px-3 py-2 text-xs font-semibold">
                      <ImageIcon size={15} /> Gambar bawaan
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label htmlFor="article-cover" className="text-xs font-semibold text-main">URL atau path gambar</label>
                <input
                  id="article-cover"
                  value={form.coverImage}
                  onChange={(event) => updateField('coverImage', event.target.value)}
                  className={fieldClass}
                  placeholder="https://... atau /assets/..."
                />
              </div>
            </div>
          </section>

          <div className="rounded-2xl border border-border-custom bg-sub-slate/50 p-4 text-xs leading-5 text-muted">
            <div className="mb-1.5 flex items-center gap-2 font-semibold text-main"><FileText size={15} /> Checklist sebelum terbit</div>
            Pastikan judul jelas, ringkasan tidak terpotong, gambar dapat dibuka, dan preview Markdown sudah rapi.
          </div>
        </aside>
      </div>
    </form>
  );
}
