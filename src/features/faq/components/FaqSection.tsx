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

  if (!faqs || faqs.length === 0) return null;

  const isAcme = theme === 'acme';

  return (
    <section id="faq" className="space-y-4 scroll-mt-20 w-full">
      {showHeader && (
        <div className="pb-2 text-center max-w-3xl mx-auto space-y-2">
          <div className={`text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 ${isAcme ? 'text-[#111210]' : 'text-acc-blue'}`}>
            <HelpCircle size={16} /> FAQ
          </div>
          <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isAcme ? 'text-[#111210]' : 'text-main'}`}>
            Frequently Asked Questions (FAQ)
          </h2>
          <p className={`text-xs sm:text-sm ${isAcme ? 'text-[#52534e]' : 'text-muted'}`}>
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
                  ? 'bg-[#f2f2ef] rounded-xl overflow-hidden transition-all duration-200 border border-black/8 shadow-2xs'
                  : 'bg-card rounded-2xl overflow-hidden transition-all duration-200 border border-border-custom/40 shadow-2xs'
              }
            >
              <button
                onClick={() => toggleAccordion(faq.id)}
                className={`w-full flex items-center justify-between p-4 sm:p-4.5 text-left font-bold transition-colors cursor-pointer gap-3 sm:gap-4 ${
                  isAcme
                    ? 'text-[#111210] hover:text-black'
                    : 'text-main hover:text-acc-blue'
                }`}
                aria-expanded={isOpen}
              >
                <span className="text-xs sm:text-sm flex items-center gap-2.5 sm:gap-3 leading-snug font-bold">
                  <span
                    className={
                      isAcme
                        ? 'text-white text-[10px] sm:text-xs font-extrabold bg-[#111210] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md shrink-0'
                        : 'text-acc-blue text-[10px] sm:text-xs font-extrabold bg-sub-blue px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg shrink-0'
                    }
                  >
                    #{index + 1}
                  </span>
                  <span className="break-words">{faq.question}</span>
                </span>
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    isAcme
                      ? isOpen
                        ? 'rotate-180 bg-[#111210] text-white'
                        : 'bg-[#e6e6e2] text-[#52534e]'
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
                      ? 'border-black/5 text-[#52534e] bg-[#f7f7f5]'
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
                        <strong className={`font-bold ${isAcme ? 'text-[#111210]' : 'text-main'}`}>
                          {children}
                        </strong>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          className={`font-bold hover:underline ${isAcme ? 'text-[#111210]' : 'text-acc-blue'}`}
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
