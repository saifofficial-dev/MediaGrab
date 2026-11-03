/**
 * Media format and analysis types
 */

export interface MediaFormat {
  id: string;
  format: 'mp4' | 'webm' | 'mov' | 'mp3' | 'm4a' | 'wav';
  quality: string; // e.g. "1080p Full HD", "720p HD", "480p SD", "320 kbps High Quality"
  resolution?: string; // "1920x1080", "1280x720", etc.
  isAudioOnly: boolean;
  hasAudio: boolean;
  hasVideo: boolean;
  filesizeEstimate?: string;
  filesizeBytes?: number;
  mimeType: string;
  directStreamUrl: string;
  note?: string;
}

export interface PlatformInfo {
  id: string;
  name: string;
  icon: string;
  status: 'active' | 'authorized_meta' | 'restricted';
  statusLabel: string;
  description: string;
  supportedFormats: string[];
  maxResolution: string;
}

export interface AnalyzeResult {
  platform: string;
  platformId: string;
  platformIcon?: string;
  title: string;
  author?: string;
  authorUrl?: string;
  thumbnail: string;
  duration?: string;
  durationSeconds?: number;
  sourceUrl: string;
  availableFormats: MediaFormat[];
  status: 'ready' | 'restricted' | 'partial';
  restrictionReason?: string;
  extractedAt: string;
}

export interface AnalyzeRequest {
  url: string;
}

export interface DownloadRequest {
  url: string;
  formatId: string;
  title?: string;
}
