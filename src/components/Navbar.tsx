import React from 'react';
import { useTheme } from '../context/ThemeContext.tsx';
import { Sun, Moon, ArrowDownToLine, Menu, X } from 'lucide-react';

interface NavbarProps {
  onQuickDemoClick: () => void;
  onOpenLegal: (type: 'terms' | 'privacy' | 'copyright') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onQuickDemoClick }) => {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/90 dark:bg-[#0B1020]/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element Brand Zone with embedded icon mark */}
        <a
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#635BFF] to-[#8C85FF] flex items-center justify-center text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <ArrowDownToLine className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span>MediaGrab</span>
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a
            href="#analyzer"
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Downloader
          </a>
          <a
            href="#how-it-works"
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            How It Works
          </a>
          <a
            href="#platforms"
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Supported Platforms
          </a>
          <a
            href="#features"
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Features
          </a>
          <a
            href="#faq"
            className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            FAQ
          </a>
        </nav>

        {/* Zone 3: 1 primary action + Theme Switcher */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onQuickDemoClick}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#635BFF] hover:bg-[#5249ea] active:scale-[0.98] rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Try Sample Demo</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1020] px-4 pt-3 pb-5 space-y-3">
          <nav className="flex flex-col space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <a
              href="#analyzer"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#635BFF]"
            >
              Downloader
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#635BFF]"
            >
              How It Works
            </a>
            <a
              href="#platforms"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#635BFF]"
            >
              Supported Platforms
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#635BFF]"
            >
              Features
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1.5 hover:text-[#635BFF]"
            >
              FAQ
            </a>
          </nav>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onQuickDemoClick();
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 text-xs font-semibold text-white bg-[#635BFF] rounded-lg"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Try Sample Demo</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
