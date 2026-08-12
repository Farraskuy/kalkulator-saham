'use client';

import { useRef, useState } from 'react';
import { Bold, Eye, Heading2, Link2, List } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';
import { AdminCrudNotice, AdminEditorHeader, fieldClass } from '@/features/admin/components/AdminCrudUi';

export type FaqEditorData = { id?: string; question: string; slug: string; answer: string; order: number };
const emptyFaq: FaqEditorData = { question: '', slug: '', answer: '', order: 1 };
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

export default function FaqEditorForm({ mode, initialData }: { mode: 'create' | 'edit'; initialData?: FaqEditorData }) {
  const router = useRouter();
  const answerRef = useRef<HTMLTextAreaElement>(null);
  const [form, setForm] = useState<FaqEditorData>(initialData || emptyFaq);
  const [tab, setTab] = useState<'write' | 'preview'>('write');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const update = <K extends keyof FaqEditorData>(key: K, value: FaqEditorData[K]) => setForm((current) => ({ ...current, [key]: value }));
  const insert = (before: string, after = '', fallback = 'teks') => {
    const input = answerRef.current; if (!input) return;
    const start = input.selectionStart; const end = input.selectionEnd; const selected = form.answer.slice(start, end) || fallback;
    update('answer', `${form.answer.slice(0, start)}${before}${selected}${after}${form.answer.slice(end)}`);
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    const slug = slugify(form.question);
    if (!form.question.trim() || !form.answer.trim()) return setError('Pertanyaan dan jawaban wajib diisi.');
    setSubmitting(true);
    try {
      const response = await fetch('/api/faqs', {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, slug }),
      });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'FAQ gagal disimpan.');
      router.push('/admin/faqs'); router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'FAQ gagal disimpan.'); } finally { setSubmitting(false); }
  };
  return <form onSubmit={save} className="mx-auto max-w-5xl space-y-5 pb-10">
    <AdminEditorHeader backHref="/admin/faqs" eyebrow="Konten / FAQ" title={mode === 'create' ? 'Tambah FAQ' : 'Edit FAQ'} description="Gunakan Markdown untuk jawaban yang terstruktur." actionLabel="Simpan FAQ" submitting={submitting} />
    {error && <AdminCrudNotice type="error">{error}</AdminCrudNotice>}
    <section className="rounded-2xl border border-border-custom bg-card p-5 sm:p-6">
      <div className="grid gap-5 md:grid-cols-[1fr_180px]">
        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-main">Pertanyaan *</span>
          <input
            autoFocus
            value={form.question}
            onChange={(event) => {
              const question = event.target.value;
              setForm((current) => ({ ...current, question, slug: slugify(question) }));
            }}
            className={fieldClass}
            placeholder="Contoh: Bagaimana cara menggunakan kalkulator?"
          />
        </label>
        <label className="space-y-1.5">
          <span className="text-sm font-semibold text-main">Urutan tampil</span>
          <input type="number" min={1} value={form.order} onChange={(event) => update('order', Number(event.target.value) || 1)} className={fieldClass} />
        </label>
      </div>
    </section>
    <section className="overflow-hidden rounded-2xl border border-border-custom bg-card"><div className="flex items-center justify-between border-b border-border-custom px-5 py-4"><div><h2 className="text-sm font-bold text-main">Jawaban *</h2><p className="text-xs text-muted">Markdown mendukung heading, teks tebal, daftar, dan tautan.</p></div><div className="flex rounded-lg bg-sub-slate p-1"><button type="button" onClick={() => setTab('write')} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${tab === 'write' ? 'bg-card text-main' : 'text-muted'}`}>Tulis</button><button type="button" onClick={() => setTab('preview')} className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold ${tab === 'preview' ? 'bg-card text-main' : 'text-muted'}`}><Eye size={13} /> Preview</button></div></div><div className="border-b border-border-custom px-5 py-2"><div className="flex gap-1"><button type="button" onClick={() => insert('## ')} className="rounded-lg px-2 py-1.5 text-xs text-muted hover:bg-sub-slate"><Heading2 size={15} /></button><button type="button" onClick={() => insert('**', '**')} className="rounded-lg px-2 py-1.5 text-xs text-muted hover:bg-sub-slate"><Bold size={15} /></button><button type="button" onClick={() => insert('- ')} className="rounded-lg px-2 py-1.5 text-xs text-muted hover:bg-sub-slate"><List size={15} /></button><button type="button" onClick={() => insert('[', '](https://)')} className="rounded-lg px-2 py-1.5 text-xs text-muted hover:bg-sub-slate"><Link2 size={15} /></button></div></div>{tab === 'write' ? <textarea ref={answerRef} value={form.answer} onChange={(event) => update('answer', event.target.value)} className="min-h-72 w-full resize-y bg-card px-5 py-4 font-mono text-sm leading-7 text-main outline-none" placeholder="Tulis jawaban FAQ di sini..." /> : <div className="prose max-w-none p-5 text-sm text-main dark:prose-invert"><ReactMarkdown>{form.answer || '_Preview jawaban akan tampil di sini._'}</ReactMarkdown></div>}</section>
  </form>;
}
