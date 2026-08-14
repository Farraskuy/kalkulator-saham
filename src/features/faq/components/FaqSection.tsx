'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { FaqItemData } from '@/types';

interface FaqSectionProps {
  faqs: FaqItemData[];
  showHeader?: boolean;
  theme?: 'default' | 'acme';
}

export default function FaqSection({ faqs, showHeader = false, theme = 'default' }: FaqSectionProps) {
  const [openId, setOpenId] = useState<string | null>(faqs.length > 0 ? faqs[0].id : null);

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  const isAcme = theme === 'acme';

  if (!faqs || faqs.length === 0) {
    return (
      <section id="faq" className="space-y-4 scroll-m-50 w-full">
        {showHeader && (
          <div className="pb-2 text-center max-w-3xl mx-auto space-y-2">
            <div className={`text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 ${isAcme ? 'text-main' : 'text-acc-blue'}`}>
              <HelpCircle size={16} /> FAQ
            </div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isAcme ? 'text-main' : 'text-main'}`}>
              Frequently Asked Questions (FAQ)
            </h2>
          </div>
        )}
        <div className={`max-w-4xl mx-auto text-center p-8 py-40 rounded-2xl border e ? 'bg-card border-border-custom text-muted' : 'bg-card border-border-custom/40 text-muted'}`}>
          <h3 className={`text-base font-bold mb-1 ${isAcme ? 'text-main' : 'text-main'}`}>
            Belum Ada Pertanyaan FAQ
          </h3>
          <p className="text-xs max-w-md mx-auto leading-relaxed">
            Saat ini belum ada pertanyaan FAQ yang dipublikasikan di database. Silakan kembali lagi nanti.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="faq" className="space-y-4 scroll-mt-20 w-full">
      {showHeader && (
        <div className="pb-2 text-center max-w-3xl mx-auto space-y-2">
          <div className={`text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 ${isAcme ? 'text-main' : 'text-acc-blue'}`}>
            <HelpCircle size={16} /> FAQ
          </div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isAcme ? 'text-main' : 'text-main'}`}>
            Frequently Asked Questions (FAQ)
          </h2>
          <p className={`text-xs sm:text-sm ${isAcme ? 'text-muted' : 'text-muted'}`}>
            Pertanyaan umum seputar fitur Hitungsaham.com, aturan BEI, serta strategi trading.
          </p>
        </div>
      )}

      {/* Individual FAQ Cards Stack */}
      <div className="max-w-4xl mx-auto space-y-3">
        {faqs.map((faq, index) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              className={
                isAcme
                  ? 'bg-card rounded-xl overflow-hidden transition-all duration-200 border border-border-custom shadow-2xs'
                  : 'bg-card rounded-2xl overflow-hidden transition-all duration-200 border border-border-custom/40 shadow-2xs'
              }
            >
              <button
                onClick={() => toggleAccordion(faq.id)}
                className={`w-full flex items-start sm:items-center justify-between p-4 sm:p-4.5 text-left font-bold transition-colors cursor-pointer gap-3 sm:gap-4 ${
                  isAcme
                    ? 'text-main hover:text-main'
                    : 'text-main hover:text-acc-blue'
                }`}
                aria-expanded={isOpen}
              >
                <div className="flex flex-col sm:flex-row sm:items-center items-start gap-1.5 sm:gap-3 leading-snug font-bold min-w-0 flex-1">
                  <span
                    className={
                      isAcme
                        ? 'text-white text-[10px] sm:text-xs font-extrabold bg-[#111210] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md shrink-0'
                        : 'text-acc-blue text-[10px] sm:text-xs font-extrabold bg-sub-blue px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg shrink-0'
                    }
                  >
                    #{index + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-main break-words leading-snug">{faq.question}</span>
                </div>
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 mt-0.5 sm:mt-0 ${
                    isAcme
                      ? isOpen
                        ? 'rotate-180 bg-[#111210] text-white'
                        : 'bg-sub-slate text-muted'
                      : isOpen
                      ? 'rotate-180 bg-sub-blue text-acc-blue'
                      : 'bg-sub-slate text-muted'
                  }`}
                >
                  <ChevronDown size={18} />
                </div>
              </button>

              {isOpen && (
                <div
                  className={`px-5 pb-5 pt-3 text-xs sm:text-sm leading-relaxed border-t animate-fade-in space-y-2 ${
                    isAcme
                      ? 'border-border-custom text-muted bg-page'
                      : 'border-border-custom/50 text-sub'
                  }`}
                >
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 mb-2">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 mb-2">{children}</ol>,
                      li: ({ children }) => <li className="leading-normal">{children}</li>,
                      strong: ({ children }) => (
                        <strong className={`font-bold ${isAcme ? 'text-main' : 'text-main'}`}>
                          {children}
                        </strong>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          className={`font-bold hover:underline ${isAcme ? 'text-main' : 'text-acc-blue'}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                    }}
                  >
                    {faq.answer}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
