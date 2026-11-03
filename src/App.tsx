import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { MediaResult } from './components/MediaResult.tsx';
import { SupportedPlatforms } from './components/SupportedPlatforms.tsx';
import { HowItWorks } from './components/HowItWorks.tsx';
import { Features } from './components/Features.tsx';
import { FaqSection } from './components/FaqSection.tsx';
import { Footer } from './components/Footer.tsx';
import { LegalModal, LegalModalType } from './components/LegalModals.tsx';
import { AnalyzeResult, PlatformInfo } from './types.ts';
import { SampleVideo, SAMPLE_VIDEOS, SUPPORTED_PLATFORMS } from './server/adapters/index.ts';
import { clientAnalyzeMedia } from './utils/clientAnalyzer.ts';

export default function App() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [samples, setSamples] = useState<SampleVideo[]>(SAMPLE_VIDEOS);
  const [platforms, setPlatforms] = useState<PlatformInfo[]>(SUPPORTED_PLATFORMS);
  const [legalModal, setLegalModal] = useState<LegalModalType>(null);

  // Load verified samples and platform status from backend on mount
  useEffect(() => {
    fetch('/api/samples')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch samples');
      })
      .then((data) => {
        if (data.samples) setSamples(data.samples);
        if (data.platforms) setPlatforms(data.platforms);
      })
      .catch(() => {
        // Fallback to imported constants
      });
  }, []);

  const handleAnalyze = async (targetUrl?: string) => {
    const finalUrl = (targetUrl || url).trim();
    if (!finalUrl) return;

    setIsLoading(true);
    setError(null);

    try {
      let data: AnalyzeResult | null = null;

      try {
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: finalUrl }),
        });

        const contentType = response.headers.get('content-type') || '';

        // If the server returned JSON (e.g. local dev / full-stack server)
        if (contentType.includes('application/json')) {
          const json = await response.json();
          if (response.ok) {
            data = json;
          } else {
            throw new Error(json.message || json.error || 'Failed to analyze video');
          }
        }
      } catch (networkErr: unknown) {
        // If server returned non-JSON (like Netlify SPA redirect returning index.html) or network failed
        console.warn('Backend API unavailable or returned non-JSON, falling back to client-side extraction:', networkErr);
      }

      // If backend was not available or static host (Netlify / Vercel), use client-side extraction
      if (!data) {
        data = await clientAnalyzeMedia(finalUrl);
      }

      setResult(data);
      // Smooth scroll to results
      setTimeout(() => {
        const resultEl = document.getElementById('media-result');
        if (resultEl) {
          resultEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to analyze video. Please verify the URL and try again.';
      setError(msg);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sample: SampleVideo) => {
    setUrl(sample.url);
    handleAnalyze(sample.url);
  };

  const handleQuickDemo = () => {
    if (samples.length > 0) {
      handleSelectSample(samples[0]);
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-[#0B1020] text-slate-100 transition-colors duration-200">
        {/* Top Bar */}
        <Navbar
          onQuickDemoClick={handleQuickDemo}
          onOpenLegal={setLegalModal}
        />

        {/* Main Content */}
        <main className="flex-1">
          {/* Hero Section */}
          <Hero
            url={url}
            setUrl={setUrl}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            error={error}
            sampleVideos={samples}
            onSelectSample={handleSelectSample}
          />

          {/* Media Result Container */}
          <div id="media-result">
            {result && (
              <MediaResult
                result={result}
                onClear={() => {
                  setResult(null);
                  setUrl('');
                }}
              />
            )}
          </div>

          {/* How It Works */}
          <HowItWorks />

          {/* Supported Platforms Grid */}
          <SupportedPlatforms
            platforms={platforms}
            onSelectPlatformUrl={(testUrl) => {
              setUrl(testUrl);
              handleAnalyze(testUrl);
            }}
          />

          {/* Features */}
          <Features />

          {/* FAQ Accordion */}
          <FaqSection />
        </main>

        {/* Footer */}
        <Footer onOpenLegal={setLegalModal} />

        {/* Legal Modals */}
        <LegalModal
          type={legalModal}
          onClose={() => setLegalModal(null)}
        />
      </div>
    </ThemeProvider>
  );
}
