import React from 'react';
import {
  Layers,
  Sparkles,
  Zap,
  Smartphone,
  ShieldCheck,
  UserX,
  Gauge,
  Lock,
} from 'lucide-react';

export const Features: React.FC = () => {
  const featureList = [
    {
      icon: <Layers className="w-5 h-5 text-[#635BFF]" />,
      title: 'Universal Platform Adapters',
      description: 'Dedicated adapters for YouTube, Reddit, Vimeo, TikTok, Dailymotion, X, and direct video links.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-[#635BFF]" />,
      title: 'Lossless & Multi-Resolution',
      description: 'Select from 4K (2160p), 1440p, 1080p Full HD down to 360p bandwidth savers. Only real, available streams are presented.',
    },
    {
      icon: <Zap className="w-5 h-5 text-[#635BFF]" />,
      title: 'Direct Streaming Pipeline',
      description: 'Our backend pipes media streams on-the-fly directly to your browser without storing temporary gigabytes on disk.',
    },
    {
      icon: <UserX className="w-5 h-5 text-[#635BFF]" />,
      title: 'Zero Account Required',
      description: 'No accounts, no credit cards, and no intrusive email sign-ups. Built as a pure frictionless utility.',
    },
    {
      icon: <Lock className="w-5 h-5 text-[#635BFF]" />,
      title: 'SSRF & Rebinding Protected',
      description: 'Enterprise security filters block loopbacks, internal IPs, and unauthorized protocols, securing our infrastructure.',
    },
    {
      icon: <Smartphone className="w-5 h-5 text-[#635BFF]" />,
      title: 'Mobile-Optimized Touch UI',
      description: 'Fully responsive layout built with tactile touch targets, mobile clipboard integration, and swift format switching.',
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 border-t border-slate-200 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#635BFF] dark:text-[#8C85FF] mb-2">
            Engineered For Performance
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Built Different From Traditional Converters
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
            No deceptive popups, fake download buttons, or malware installers. Just reliable media extraction.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((f, i) => (
            <div
              key={f.title}
              className="p-6 rounded-2xl bg-white dark:bg-[#151C2E] border border-slate-200 dark:border-slate-800 hover:border-[#635BFF]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {f.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-[11px] font-mono text-slate-400 dark:text-slate-500">
                0{i + 1}. SPEC
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
