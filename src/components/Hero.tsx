import React, { useState } from 'react';
import { Clipboard, ArrowRight, Loader2, X, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { SampleVideo } from '../server/adapters/index.ts';

interface HeroProps {
  url: string;
  setUrl: (url: string) => void;
  onAnalyze: (targetUrl?: string) => void;
  isLoading: boolean;
  error: string | null;
  sampleVideos: SampleVideo[];
  onSelectSample: (sample: SampleVideo) => void;
}

export const Hero: React.FC<HeroProps> = ({
  url,
  setUrl,
  onAnalyze,
  isLoading,
  error,
  sampleVideos,
  onSelectSample,
}) => {
  const [copiedNotification, setCopiedNotification] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setCopiedNotification(true);
        setTimeout(() => setCopiedNotification(false), 2000);
      }
    } catch {
      // Clipboard read permission might not be granted; user can paste manually
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !isLoading) {
      onAnalyze();
    }
  };

  return (
    <section id="analyzer" className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Background radial glow */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-[#635BFF]/15 blur-[120px] rounded-full dark:bg-[#635BFF]/10"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        {/* Editorial kicker */}
        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-[#635BFF] dark:text-[#8C85FF] mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Universal Social Media Media Extractor</span>
        </div>

        {/* Heading with text-wrap: balance */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.15] text-balance mb-6">
          Download Videos From Your Favorite Platforms
        </h1>

        {/* Subheading */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          Paste a video link, choose your preferred format and quality, and download supported media in seconds.
        </p>

        {/* Input Form Box */}
        <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2 p-2 rounded-2xl bg-white dark:bg-[#151C2E] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-black/20 focus-within:border-[#635BFF] transition-all">
            <div className="relative flex-1 flex items-center min-w-0">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste your video URL here (e.g. YouTube, Reddit, Vimeo, TikTok, direct MP4)..."
                disabled={isLoading}
                className="w-full pl-4 pr-16 py-3.5 bg-transparent text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none disabled:opacity-60"
                required
              />

              {/* Paste button & Clear button inside input */}
              <div className="absolute right-2 flex items-center gap-1">
                {url && (
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
                    title="Clear URL"
                    aria-label="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePaste}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-[#635BFF] dark:hover:text-[#8C85FF] bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  title="Paste from clipboard"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Paste</span>
                </button>
              </div>
            </div>

            {/* Analyze Action Button */}
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#635BFF] hover:bg-[#5249ea] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-md transition-all cursor-pointer shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Analyze Video</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {copiedNotification && (
            <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Link pasted from clipboard</span>
            </div>
          )}
        </form>

        {/* Error Notification Banner */}
        {error && (
          <div className="mt-6 max-w-2xl mx-auto p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-start gap-3 text-left animate-fadeIn">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Unable to extract media</p>
              <p className="text-xs mt-1 text-slate-600 dark:text-slate-300 leading-relaxed">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => onAnalyze()}
              className="text-xs font-semibold underline hover:no-underline text-red-600 dark:text-red-400 shrink-0 ml-2"
            >
              Retry
            </button>
          </div>
        )}

        {/* Quick Test Samples */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 max-w-3xl mx-auto text-left">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Try a verified test URL:
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 hidden sm:inline">
              1-click instant verification
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {sampleVideos.map((sample) => (
              <button
                key={sample.title}
                type="button"
                onClick={() => onSelectSample(sample)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-[#151C2E] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-lg transition-colors cursor-pointer"
              >
                <span className="font-semibold text-[#635BFF] dark:text-[#8C85FF]">{sample.platform}:</span>
                <span className="truncate max-w-[160px] sm:max-w-[200px]">{sample.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
