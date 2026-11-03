import React from 'react';
import { X, Shield, FileText, Copyright } from 'lucide-react';

export type LegalModalType = 'terms' | 'privacy' | 'copyright' | null;

interface LegalModalProps {
  type: LegalModalType;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#151C2E] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {type === 'terms' && <FileText className="w-5 h-5 text-[#635BFF]" />}
            {type === 'privacy' && <Shield className="w-5 h-5 text-emerald-500" />}
            {type === 'copyright' && <Copyright className="w-5 h-5 text-sky-500" />}
            <h3 className="font-bold text-base text-slate-900 dark:text-white capitalize">
              {type === 'terms' && 'Terms of Service'}
              {type === 'privacy' && 'Privacy Policy'}
              {type === 'copyright' && 'Copyright & DMCA Compliance'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {type === 'terms' && (
            <>
              <p>
                <strong>1. Acceptance of Terms:</strong> By accessing and utilizing MediaGrab, you agree to comply with and be bound by these Terms of Service. If you do not accept these terms, you are advised to refrain from using the service.
              </p>
              <p>
                <strong>2. Authorized Usage:</strong> MediaGrab is provided solely as an analysis and retrieval utility for publicly accessible media. Users are strictly prohibited from using the service to access private accounts, circumvent paywalls or access controls, or infringe upon third-party copyrights.
              </p>
              <p>
                <strong>3. Compliance with Platform Policies:</strong> MediaGrab respects the terms of service of third-party platforms (including YouTube, Reddit, Vimeo, TikTok, Meta, and others). Features are restricted or modified where required by platform authorization guidelines.
              </p>
              <p>
                <strong>4. Disclaimer of Warranties:</strong> The service is provided on an &quot;as-is&quot; and &quot;as-available&quot; basis without warranties of any kind, whether express or implied.
              </p>
            </>
          )}

          {type === 'privacy' && (
            <>
              <p>
                <strong>1. No Media Storage:</strong> MediaGrab does not host, store, or cache media files or video downloads on permanent server disks. All media streams are transmitted in real time directly to your client connection.
              </p>
              <p>
                <strong>2. URL Confidentiality:</strong> URLs analyzed through our application are processed in memory and are never published, sold, or shared with third-party advertisers.
              </p>
              <p>
                <strong>3. Ephemeral Rate Limiting:</strong> In order to defend our servers against denial-of-service and brute-force abuse, anonymized client IP addresses are tracked ephemerally in volatile memory with a sliding window and purged automatically.
              </p>
              <p>
                <strong>4. Cookies:</strong> MediaGrab uses local storage solely to store your dark/light theme preference. No tracking cookies or advertising pixels are deployed.
              </p>
            </>
          )}

          {type === 'copyright' && (
            <>
              <p>
                <strong>1. Respect for Intellectual Property:</strong> MediaGrab strictly respects the intellectual property rights of content creators, rights holders, and platforms. We do not support unauthorized distribution or copyright infringement.
              </p>
              <p>
                <strong>2. Digital Millennium Copyright Act (DMCA):</strong> It is our policy to respond promptly to clear notices of alleged copyright infringement that comply with the DMCA and other applicable intellectual property laws.
              </p>
              <p>
                <strong>3. Anti-Circumvention Policy:</strong> MediaGrab does not provide tools to decrypt encrypted streams or bypass digital rights management (DRM) mechanisms such as Widevine, FairPlay, or PlayReady.
              </p>
              <p>
                <strong>4. DMCA Contact:</strong> If you are a copyright owner or an agent thereof and believe that any content made accessible via MediaGrab infringes upon your copyrights, please contact our legal team at <code>dmca@mediagrab.internal</code> with proper identification and proof of ownership.
              </p>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#635BFF] hover:bg-[#5249ea] rounded-lg transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
