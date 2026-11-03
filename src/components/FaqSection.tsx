import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'Which social media and video platforms are currently supported?',
      answer: 'MediaGrab features verified live adapters for YouTube (including Shorts), Reddit (with DASH video and audio stream parsing), Vimeo, TikTok, Dailymotion, X (Twitter), Pinterest, and direct video links (.mp4, .webm, .mov). Platforms with private account boundaries or login sessions (such as Instagram and Facebook private feeds) are extracted where public embed authorization permits.',
    },
    {
      question: 'Can I extract and download audio only (MP3 or M4A)?',
      answer: 'Yes! For all supported video sources, MediaGrab provides dedicated audio format options, including 320 kbps MP3 and high-fidelity AAC (M4A) streams, ideal for podcasts, music clips, and lectures.',
    },
    {
      question: 'How do you determine available resolutions (4K, 1080p, 720p)?',
      answer: 'We only show video resolutions that actually exist on the source video. If a video was uploaded in 720p, we never display fake 4K or 1080p options. The available options reflect the true master and transcoded streams available from the provider.',
    },
    {
      question: 'Do you store or log my downloaded files or URLs on your server?',
      answer: 'No. MediaGrab operates as a real-time streaming proxy. Video packets are piped directly to your client connection in memory without writing temporary files to persistent disk storage. We do not maintain databases of user submission URLs.',
    },
    {
      question: 'Why does a video link sometimes fail to analyze?',
      answer: 'A link may fail if the video is marked private, age-restricted, geographical IP-blocked, or deleted by the author. In addition, our SSRF security layer strictly blocks internal, localhost, or unencrypted local targets to safeguard against network misuse.',
    },
    {
      question: 'Is it legal to download social media videos with MediaGrab?',
      answer: 'MediaGrab is designed for downloading publicly accessible media for personal use, creative commons attribution, educational reference, and archival purposes, in accordance with applicable copyright laws and platform terms. We do not bypass DRM, encryption, or password protection.',
    },
  ];

  const toggle = (idx: number) => {
    setOpenIndex(prev => (prev === idx ? null : idx));
  };

  return (
    <section id="faq" className="py-16 md:py-24 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#635BFF] dark:text-[#8C85FF] mb-2">
            Frequently Asked Questions
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Everything You Need To Know
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Answers regarding platform extraction, resolutions, privacy, and legal usage.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151C2E] overflow-hidden transition-all shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <span className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-[#635BFF]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
