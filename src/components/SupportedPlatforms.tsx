import React, { useState } from 'react';
import {
  Video,
  FileVideo,
  CheckCircle2,
  Info,
  Youtube,
  Tv,
  Music,
  Twitter,
  Instagram,
  Facebook,
  Camera,
  PlayCircle,
  ExternalLink,
} from 'lucide-react';
import { PlatformInfo } from '../types.ts';

interface SupportedPlatformsProps {
  platforms: PlatformInfo[];
  onSelectPlatformUrl: (url: string) => void;
}

export const SupportedPlatforms: React.FC<SupportedPlatformsProps> = ({
  platforms,
  onSelectPlatformUrl,
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'authorized'>('all');

  const getPlatformIcon = (id: string) => {
    switch (id) {
      case 'youtube':
        return <Youtube className="w-5 h-5 text-red-500" />;
      case 'reddit':
        return <Tv className="w-5 h-5 text-orange-500" />;
      case 'vimeo':
        return <PlayCircle className="w-5 h-5 text-sky-400" />;
      case 'tiktok':
        return <Music className="w-5 h-5 text-pink-500" />;
      case 'twitter':
        return <Twitter className="w-5 h-5 text-slate-400" />;
      case 'instagram':
        return <Instagram className="w-5 h-5 text-rose-500" />;
      case 'facebook':
        return <Facebook className="w-5 h-5 text-blue-500" />;
      case 'snapchat':
        return <Camera className="w-5 h-5 text-yellow-400" />;
      case 'direct':
        return <FileVideo className="w-5 h-5 text-emerald-400" />;
      case 'dailymotion':
        return <Video className="w-5 h-5 text-cyan-400" />;
      default:
        return <Video className="w-5 h-5 text-[#635BFF]" />;
    }
  };

  const filteredPlatforms = platforms.filter((p) => {
    if (filter === 'active') return p.status === 'active';
    if (filter === 'authorized') return p.status === 'authorized_meta';
    return true;
  });

  return (
    <section id="platforms" className="py-16 md:py-24 border-t border-slate-200 dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#635BFF] dark:text-[#8C85FF] mb-2">
              Platform Integration Matrix
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
              Supported Platforms & Formats
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl">
              Modular extraction adapters built to respect copyright laws, DRM boundaries, and platform authentication rules.
            </p>
          </div>

          {/* Interactive filter controls (§1.A Allowed segmented controls) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filter === 'all'
                  ? 'bg-white dark:bg-[#151C2E] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Platforms ({platforms.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('active')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filter === 'active'
                  ? 'bg-white dark:bg-[#151C2E] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Active & Verified
            </button>
            <button
              type="button"
              onClick={() => setFilter('authorized')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                filter === 'authorized'
                  ? 'bg-white dark:bg-[#151C2E] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Public Metadata Only
            </button>
          </div>
        </div>

        {/* Platform Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlatforms.map((p) => {
            const isActive = p.status === 'active';
            return (
              <div
                key={p.id}
                className="p-6 rounded-2xl bg-white dark:bg-[#151C2E] border border-slate-200 dark:border-slate-800 hover:border-[#635BFF]/40 dark:hover:border-[#635BFF]/40 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center transition-transform group-hover:scale-105">
                        {getPlatformIcon(p.id)}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          {p.name}
                        </h3>
                        {/* Unboxed Status Text with subtle separator */}
                        <div className="flex items-center gap-1.5 text-xs mt-0.5">
                          {isActive ? (
                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{p.statusLabel}</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                              <Info className="w-3 h-3" />
                              <span>{p.statusLabel}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                    {p.description}
                  </p>
                </div>

                {/* Card Footer: Formats & Resolution info */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span>Formats:</span>
                    <span className="text-slate-800 dark:text-slate-200 font-mono">
                      {p.supportedFormats.join(', ')}
                    </span>
                  </div>

                  <div className="font-mono text-[11px] text-[#635BFF] dark:text-[#8C85FF] font-semibold">
                    {p.maxResolution}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Regulatory & Ethical Compliance Callout */}
        <div className="mt-10 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5">
          <Info className="w-5 h-5 text-[#635BFF] shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-900 dark:text-white">Compliance Guarantee: </span>
            MediaGrab strictly abides by platform terms of service and applicable intellectual property laws. We do not circumvent digital rights management (DRM), access control systems, or authenticate private profiles without authorization. All media must be publicly available and authorized for retrieval.
          </div>
        </div>
      </div>
    </section>
  );
};
