import React from 'react';
import { Copy, Link2, SlidersHorizontal, ArrowDownToLine } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Copy Video Link',
      description: 'Navigate to any supported platform (YouTube, Reddit, Vimeo, TikTok, X, or direct file) and copy the shareable video link.',
      icon: <Copy className="w-5 h-5 text-[#635BFF]" />,
    },
    {
      number: '02',
      title: 'Paste URL & Analyze',
      description: 'Paste the link into the MediaGrab search bar. Our backend validates safety and analyzes available media streams.',
      icon: <Link2 className="w-5 h-5 text-[#635BFF]" />,
    },
    {
      number: '03',
      title: 'Select Format & Quality',
      description: 'Choose your desired container (MP4, WebM, MP3) and resolution (from 2160p 4K down to 360p or high-bitrate audio).',
      icon: <SlidersHorizontal className="w-5 h-5 text-[#635BFF]" />,
    },
    {
      number: '04',
      title: 'Download Instantly',
      description: 'Click download to stream the sanitized media file directly to your device with zero ads and zero data retention.',
      icon: <ArrowDownToLine className="w-5 h-5 text-[#635BFF]" />,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#635BFF] dark:text-[#8C85FF] mb-2">
            Simple 4-Step Process
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            How MediaGrab Works
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Engineered for speed, security, and simplicity without bloated software or extensions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="p-6 rounded-2xl bg-white dark:bg-[#151C2E] border border-slate-200 dark:border-slate-800 shadow-sm relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center">
                    {step.icon}
                  </div>
                  <span className="font-mono text-2xl font-bold text-slate-200 dark:text-slate-800">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[11px] font-medium text-slate-400">
                Step {step.number} of 04
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
