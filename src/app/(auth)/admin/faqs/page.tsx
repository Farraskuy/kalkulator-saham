'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, HelpCircle, ArrowUpDown } from 'lucide-react';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export default function AdminFaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form modal/editor states
  const [editingFaq, setEditingFaq] = useState<FaqItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [questionInput, setQuestionInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [orderInput, setOrderInput] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/faqs');
      const data = await res.json();
      if (data.faqs && Array.isArray(data.faqs)) {
        setFaqs(data.faqs);
      }
    } catch (err) {
      console.error('Failed to load FAQs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const openCreateModal = () => {
    setEditingFaq(null);
    setQuestionInput('');
    setAnswerInput('');
    setOrderInput(faqs.length + 1);
    setIsCreating(true);
  };

  const openEditModal = (faq: FaqItem) => {
    setIsCreating(false);
    setEditingFaq(faq);
    setQuestionInput(faq.question);
    setAnswerInput(faq.answer);
    setOrderInput(faq.order || 1);
  };

  const closeModal = () => {
    setIsCreating(false);
    setEditingFaq(null);
    setQuestionInput('');
    setAnswerInput('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || !answerInput.trim()) {
      setMessage({ type: 'error', text: 'Pertanyaan dan jawaban wajib diisi.' });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      if (isCreating) {
        const res = await fetch('/api/faqs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: questionInput,
            answer: answerInput,
            order: orderInput,
          }),
        });

        if (res.ok) {
          setMessage({ type: 'success', text: 'FAQ baru berhasil ditambahkan!' });
          closeModal();
          fetchFaqs();
        } else {
          const errData = await res.json();
          setMessage({ type: 'error', text: errData.error || 'Gagal menambah FAQ.' });
        }
      } else if (editingFaq) {
        const res = await fetch('/api/faqs', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingFaq.id,
            question: questionInput,
            answer: answerInput,
            order: orderInput,
          }),
        });

        if (res.ok) {
          setMessage({ type: 'success', text: 'FAQ berhasil diperbarui!' });
          closeModal();
          fetchFaqs();
        } else {
          const errData = await res.json();
          setMessage({ type: 'error', text: errData.error || 'Gagal memperbarui FAQ.' });
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan koneksi.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus item FAQ ini?')) return;

    setMessage(null);
    try {
      const res = await fetch(`/api/faqs?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'FAQ berhasil dihapus!' });
        fetchFaqs();
      } else {
        setMessage({ type: 'error', text: 'Gagal menghapus FAQ.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {message && (
        <div
          className={`p-4 rounded-2xl font-bold text-xs border ${
            message.type === 'success'
              ? 'bg-sub-green border-acc-green text-acc-green'
              : 'bg-sub-pink border-acc-pink text-acc-pink'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Header Info & Action */}
      <div className="bg-card rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-sm tracking-tight text-main flex items-center gap-2">
            <HelpCircle size={18} className="text-acc-blue" />
            <span>Kelola Kelola Frequently Asked Questions (FAQ)</span>
          </h3>
          <p className="text-xs text-muted mt-1 leading-relaxed">
            Tambah, edit, hapus, dan atur urutan accordion FAQ yang tampil pada halaman utama website.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 bg-acc-blue hover:bg-acc-blue/90 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus size={16} /> <span>Tambah FAQ Baru</span>
        </button>
      </div>

      {/* Modal / Form Inline Overlay */}
      {(isCreating || editingFaq) && (
        <div className="bg-card border-2 border-acc-blue/30 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-border-custom pb-3">
            <h4 className="font-extrabold text-sm text-main">
              {isCreating ? 'Tambah FAQ Baru' : 'Edit FAQ'}
            </h4>
            <button onClick={closeModal} className="text-muted hover:text-main">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-3 space-y-1">
                <label className="text-xs font-bold text-muted block">Pertanyaan</label>
                <input
                  type="text"
                  className="w-full bg-page rounded-xl px-4 py-2.5 text-main text-xs font-semibold outline-none focus:border-acc-blue"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="Masukkan judul pertanyaan..."
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted block flex items-center gap-1">
                  <ArrowUpDown size={13} /> Urutan Tampil
                </label>
                <input
                  type="number"
                  className="w-full bg-page rounded-xl px-4 py-2.5 text-main text-xs font-semibold outline-none focus:border-acc-blue"
                  value={orderInput}
                  onChange={(e) => setOrderInput(parseInt(e.target.value, 10) || 1)}
                  min={1}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-muted block">Jawaban</label>
              <textarea
                rows={5}
                className="w-full bg-page rounded-xl px-4 py-2.5 text-main text-xs font-semibold outline-none focus:border-acc-blue leading-relaxed"
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder="Masukkan jawaban rinci..."
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-muted hover:bg-sub-slate"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 bg-acc-blue hover:bg-acc-blue/90 text-white font-bold py-2 px-5 rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Check size={15} />
                <span>{submitting ? 'Menyimpan...' : 'Simpan FAQ'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FAQ Table List */}
      <div className="bg-card rounded-3xl p-6">
        {loading ? (
          <div className="text-center py-8 text-xs font-bold text-muted">Memuat daftar FAQ...</div>
        ) : faqs.length === 0 ? (
          <div className="text-center py-8 text-xs font-bold text-muted">
            Belum ada FAQ. Klik button &quot;Tambah FAQ Baru&quot; di atas.
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={faq.id}
                className="bg-page rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold bg-sub-blue text-acc-blue px-2 py-0.5 rounded-md shrink-0">
                      Urutan #{faq.order !== undefined ? faq.order : idx + 1}
                    </span>
                    <h4 className="font-extrabold text-xs text-main truncate">{faq.question}</h4>
                  </div>
                  <p className="text-xs text-muted line-clamp-2 leading-relaxed">{faq.answer}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => openEditModal(faq)}
                    className="p-2 rounded-xl bg-sub-slate text-sub hover:bg-sub-blue hover:text-acc-blue transition-colors cursor-pointer"
                    title="Edit FAQ"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="p-2 rounded-xl bg-sub-pink text-acc-pink hover:bg-acc-pink hover:text-white transition-colors cursor-pointer"
                    title="Hapus FAQ"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
