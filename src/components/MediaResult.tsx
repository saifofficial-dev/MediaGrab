import React, { useState } from 'react';
import {
  Download,
  Video,
  Music,
  ExternalLink,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Play,
  Share2,
} from 'lucide-react';
import { AnalyzeResult, MediaFormat } from '../types.ts';

interface MediaResultProps {
  result: AnalyzeResult;
  onClear: () => void;
}

export const MediaResult: React.FC<MediaResultProps> = ({ result, onClear }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'audio'>('all');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Filter formats based on active tab
  const filteredFormats = result.availableFormats.filter((fmt) => {
    if (activeTab === 'video') return !fmt.isAudioOnly;
    if (activeTab === 'audio') return fmt.isAudioOnly;
    return true;
  });

  const handleDownload = async (format: MediaFormat) => {
    setDownloadingId(format.id);
    setDownloadError(null);
    setDownloadSuccess(null);

    try {
      // Check if it's a direct media link (e.g. .mp4, .webm, .mp3)
      const isDirectFile = format.directStreamUrl.match(/\.(mp4|webm|mov|mp3|m4a)(\?.*)?$/i);

      if (isDirectFile) {
        // Direct download anchor
        const link = document.createElement('a');
        link.href = format.directStreamUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.setAttribute('download', `${result.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${format.format}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Full-stack streaming proxy
        const params = new URLSearchParams({
          url: format.directStreamUrl,
          formatId: format.id,
          title: result.title,
          format: format.format,
        });

        const downloadEndpoint = `/api/download?${params.toString()}`;
        const link = document.createElement('a');
        link.href = downloadEndpoint;
        link.setAttribute('download', `${result.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${format.format}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setDownloadSuccess(`Download initiated for ${format.format.toUpperCase()} (${format.quality})`);
      setTimeout(() => setDownloadSuccess(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Download failed to start';
      setDownloadError(msg);
    } finally {
      setTimeout(() => {
        setDownloadingId(null);
      }, 1500);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: result.title,
        url: result.sourceUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(result.sourceUrl);
      alert('Video link copied to clipboard!');
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-16 animate-fadeIn">
      {/* Container card */}
      <div className="bg-white dark:bg-[#151C2E] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-colors">
        {/* Header bar of result */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Platform:
            </span>
            <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#635BFF]" />
              {result.platform}
            </span>

            {result.status === 'ready' && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Media Ready
              </span>
            )}
            {result.status === 'partial' && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                Public Embed Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button
              type="button"
              onClick={onClear}
              className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Analyze Another
            </button>
          </div>
        </div>

        {/* Media Details Row */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Thumbnail or Preview Player */}
          <div className="lg:col-span-5 space-y-3">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 group shadow-md">
              {isPlayingPreview && result.availableFormats.length > 0 ? (
                <video
                  src={result.availableFormats[0].directStreamUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <>
                  {result.thumbnail ? (
                    <img
                      src={result.thumbnail}
                      alt={result.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback on image error
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-950 p-6 text-center">
                      <Video className="w-12 h-12 stroke-1 mb-2 text-slate-500" />
                      <span className="text-xs font-medium text-slate-400">Media Stream Verified</span>
                    </div>
                  )}

                  {/* Play Overlay if playable format exists */}
                  {result.availableFormats.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setIsPlayingPreview(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors group-hover:scale-110 cursor-pointer"
                      title="Preview video"
                    >
                      <div className="w-14 h-14 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg transition-transform">
                        <Play className="w-6 h-6 fill-slate-900 ml-0.5" />
                      </div>
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Source URL link */}
            <a
              href={result.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#635BFF] dark:text-slate-400 dark:hover:text-[#8C85FF] transition-colors truncate max-w-full"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{result.sourceUrl}</span>
            </a>
          </div>

          {/* Right Column: Title, Metadata, Formats */}
          <div className="lg:col-span-7 flex flex-col">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug mb-3">
              {result.title}
            </h2>

            {/* Unboxed Metadata row with typographic separators (§1.A Zero-Pill Discipline) */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
              {result.author && (
                <>
                  <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                    <User className="w-3.5 h-3.5" />
                    <span>{result.author}</span>
                  </span>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                </>
              )}

              {result.duration && (
                <>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{result.duration}</span>
                  </span>
                  <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                </>
              )}

              <span>{result.availableFormats.length} formats available</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="text-emerald-600 dark:text-emerald-400">Direct Download Ready</span>
            </div>

            {/* Restriction note if partial */}
            {result.restrictionReason && (
              <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                {result.restrictionReason}
              </div>
            )}

            {/* Format Filter Tabs (Interactive Segmented Control) */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-4 self-start">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white dark:bg-[#151C2E] text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Formats ({result.availableFormats.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('video')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'video'
                    ? 'bg-white dark:bg-[#151C2E] text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('audio')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'audio'
                    ? 'bg-white dark:bg-[#151C2E] text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Audio (MP3)</span>
              </button>
            </div>

            {/* Notification banners */}
            {downloadSuccess && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{downloadSuccess}</span>
              </div>
            )}

            {downloadError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{downloadError}</span>
              </div>
            )}

            {/* Formats Grid / List */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredFormats.map((fmt) => {
                const isDownloading = downloadingId === fmt.id;
                return (
                  <div
                    key={fmt.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 hover:border-[#635BFF]/50 dark:hover:border-[#635BFF]/50 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#151C2E] border border-slate-200 dark:border-slate-700/60 flex items-center justify-center shrink-0">
                        {fmt.isAudioOnly ? (
                          <Music className="w-4 h-4 text-[#635BFF]" />
                        ) : (
                          <Video className="w-4 h-4 text-[#635BFF]" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 dark:text-white uppercase">
                            {fmt.format}
                          </span>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            {fmt.quality}
                          </span>
                          {fmt.resolution && fmt.resolution !== 'Audio Only' && (
                            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                              {fmt.resolution}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {fmt.filesizeEstimate && (
                            <span className="font-mono tabular-nums mr-2">
                              {fmt.filesizeEstimate}
                            </span>
                          )}
                          {fmt.note && <span>· {fmt.note}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Download Action Button */}
                    <button
                      type="button"
                      onClick={() => handleDownload(fmt)}
                      disabled={isDownloading}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#635BFF] hover:bg-[#5249ea] active:scale-[0.98] disabled:opacity-60 rounded-lg shadow-sm transition-all shrink-0 cursor-pointer"
                    >
                      {isDownloading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Preparing...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}

              {filteredFormats.length === 0 && (
                <div className="py-8 text-center text-sm text-slate-500">
                  No formats matching the selected filter.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
