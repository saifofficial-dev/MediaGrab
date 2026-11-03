import React from 'react';
import { ArrowDownToLine, Heart, Mail } from 'lucide-react';
import { LegalModalType } from './LegalModals.tsx';

interface FooterProps {
  onOpenLegal: (type: LegalModalType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1020] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <a href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#635BFF] to-[#8C85FF] flex items-center justify-center text-white">
                <ArrowDownToLine className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span>MediaGrab</span>
            </a>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Universal social media video and audio extraction platform. Engineered for speed, safety, and strict compliance with public content policies.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Mail className="w-3.5 h-3.5" />
              <span>contact@mediagrab.internal</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                <a href="#analyzer" className="hover:text-[#635BFF] transition-colors">
                  Video Downloader
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-[#635BFF] transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#platforms" className="hover:text-[#635BFF] transition-colors">
                  Supported Platforms
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-[#635BFF] transition-colors">
                  Features & Security
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#635BFF] transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Policies */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Legal & Compliance
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-[#635BFF] transition-colors cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-[#635BFF] transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('copyright')}
                  className="hover:text-[#635BFF] transition-colors cursor-pointer text-left"
                >
                  Copyright & DMCA Policy
                </button>
              </li>
              <li>
                <span className="text-[11px] text-slate-400">
                  DRM Circumvention Prohibited
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright notice */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 dark:text-slate-500">
          <div>
            &copy; {new Date().getFullYear()} MediaGrab. All rights reserved. Not affiliated with or endorsed by any referenced third-party platforms.
          </div>
          <div className="flex items-center gap-1">
            <span>Designed for lawful, personal and educational use</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
