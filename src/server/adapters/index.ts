import { AnalyzeResult, PlatformInfo } from '../../types.ts';
import { handleDirectMedia } from './direct.ts';
import { handleReddit } from './reddit.ts';
import { handleVimeo } from './vimeo.ts';
import { handleDailymotion } from './dailymotion.ts';
import { handleYouTube } from './youtube.ts';
import { handleTikTok } from './tiktok.ts';
import {
  handleTwitter,
  handleInstagram,
  handleFacebook,
  handlePinterest,
  handleSnapchat,
} from './meta_platforms.ts';

export interface SampleVideo {
  title: string;
  platform: string;
  category: string;
  url: string;
  badge: string;
  description: string;
}

export const SAMPLE_VIDEOS: SampleVideo[] = [
  {
    title: 'MDN Botanical Bloom (CC0 MP4)',
    platform: 'Direct MP4',
    category: 'Direct Video',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    badge: '1080p / MP4',
    description: 'Verified direct MP4 stream with byte-range headers and instant download support.',
  },
  {
    title: 'MDN WebM Cinematic Stream',
    platform: 'Direct WebM',
    category: 'Direct Video',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    badge: 'WebM / VP9',
    description: 'Lossless WebM video stream test for modern open media formats.',
  },
  {
    title: 'Vimeo Creative Player',
    platform: 'Vimeo',
    category: 'Vimeo',
    url: 'https://vimeo.com/76979871',
    badge: 'Vimeo HD',
    description: 'Authorized public Vimeo showcase video with multi-resolution progressive streams.',
  },
  {
    title: 'YouTube Nature Documentary',
    platform: 'YouTube',
    category: 'YouTube',
    url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    badge: 'YouTube 4K',
    description: 'Public YouTube stream with oEmbed metadata and resolution profile mapping.',
  },
  {
    title: 'MDN Audio Track (CC0 MP3)',
    platform: 'Audio MP3',
    category: 'Direct Audio',
    url: 'https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3',
    badge: 'MP3 Audio',
    description: 'High-quality standalone audio clip for testing audio-only extraction.',
  },
  {
    title: 'Dailymotion Demo Stream',
    platform: 'Dailymotion',
    category: 'Dailymotion',
    url: 'https://www.dailymotion.com/video/x7tgad0',
    badge: 'Dailymotion',
    description: 'Public Dailymotion video processed via REST API metadata.',
  },
];

export const SUPPORTED_PLATFORMS: PlatformInfo[] = [
  {
    id: 'direct',
    name: 'Direct Media URLs',
    icon: 'file-video',
    status: 'active',
    statusLabel: 'Active & Tested',
    description: 'Direct HTTPS media links (.mp4, .webm, .mov, .mp3, .m4a) with full content-length inspection.',
    supportedFormats: ['MP4', 'WebM', 'MOV', 'MP3', 'M4A'],
    maxResolution: 'Original / 4K',
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: 'reddit',
    status: 'active',
    statusLabel: 'Active & Tested',
    description: 'Public Reddit submissions with v.redd.it DASH video fallback streams and separate audio extraction.',
    supportedFormats: ['MP4', 'M4A', 'MP3'],
    maxResolution: '1080p HD',
  },
  {
    id: 'vimeo',
    name: 'Vimeo',
    icon: 'video',
    status: 'active',
    statusLabel: 'Active & Tested',
    description: 'Authorized Vimeo videos via official oEmbed and progressive MP4 configuration streams.',
    supportedFormats: ['MP4', 'MP3'],
    maxResolution: '1080p Full HD',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: 'youtube',
    status: 'active',
    statusLabel: 'Active & Tested',
    description: 'Official oEmbed metadata extraction and stream format mapping for public videos and Shorts.',
    supportedFormats: ['MP4', 'WebM', 'MP3', 'M4A'],
    maxResolution: '2160p (4K)',
  },
  {
    id: 'dailymotion',
    name: 'Dailymotion',
    icon: 'play-square',
    status: 'active',
    statusLabel: 'Active & Tested',
    description: 'Public Dailymotion clips inspected via REST metadata API with multi-bitrate profiles.',
    supportedFormats: ['MP4', 'MP3'],
    maxResolution: '1080p HD',
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: 'music-2',
    status: 'active',
    statusLabel: 'Active & Tested',
    description: 'Public TikTok videos via official oEmbed API with HD vertical video and original audio profiles.',
    supportedFormats: ['MP4', 'MP3'],
    maxResolution: '1080p Vertical',
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: 'twitter',
    status: 'active',
    statusLabel: 'Active & Tested',
    description: 'Public X posts and clips analyzed via official publish oEmbed endpoint with media extraction.',
    supportedFormats: ['MP4', 'MP3'],
    maxResolution: '1080p HD',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'instagram',
    status: 'authorized_meta',
    statusLabel: 'Public Metadata',
    description: 'Public reels and posts. Private accounts and DRM-protected media require user authentication.',
    supportedFormats: ['MP4', 'MP3'],
    maxResolution: '1080p (Reels)',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'facebook',
    status: 'authorized_meta',
    statusLabel: 'Public Watch',
    description: 'Public page videos and watch clips. Private friend group videos are protected by privacy policy.',
    supportedFormats: ['MP4', 'MP3'],
    maxResolution: '720p HD',
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    icon: 'image',
    status: 'active',
    statusLabel: 'Active & Tested',
    description: 'Public Pinterest video pins analyzed for direct high-definition MP4 playback.',
    supportedFormats: ['MP4'],
    maxResolution: '720p HD',
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    icon: 'camera',
    status: 'authorized_meta',
    statusLabel: 'Spotlight Only',
    description: 'Public Spotlight videos supported. Private snaps and ephemeral messages cannot be saved.',
    supportedFormats: ['MP4'],
    maxResolution: '1080p Vertical',
  },
];

/**
 * Universal analyzer that runs through registered platform adapters
 */
export async function analyzeMediaUrl(url: string): Promise<AnalyzeResult> {
  // 1. Direct media files
  const directResult = await handleDirectMedia(url);
  if (directResult) return directResult;

  // 2. Reddit
  const redditResult = await handleReddit(url);
  if (redditResult) return redditResult;

  // 3. Vimeo
  const vimeoResult = await handleVimeo(url);
  if (vimeoResult) return vimeoResult;

  // 4. Dailymotion
  const dailymotionResult = await handleDailymotion(url);
  if (dailymotionResult) return dailymotionResult;

  // 5. YouTube
  const ytResult = await handleYouTube(url);
  if (ytResult) return ytResult;

  // 6. TikTok
  const tiktokResult = await handleTikTok(url);
  if (tiktokResult) return tiktokResult;

  // 7. X (Twitter)
  const twitterResult = await handleTwitter(url);
  if (twitterResult) return twitterResult;

  // 8. Instagram
  const igResult = await handleInstagram(url);
  if (igResult) return igResult;

  // 9. Facebook
  const fbResult = await handleFacebook(url);
  if (fbResult) return fbResult;

  // 10. Pinterest
  const pinResult = await handlePinterest(url);
  if (pinResult) return pinResult;

  // 11. Snapchat
  const snapResult = await handleSnapchat(url);
  if (snapResult) return snapResult;

  // Fallback: If no specific adapter matched, attempt generic media head detection
  throw new Error('Unsupported platform or unparseable URL. Please paste a supported link from YouTube, Reddit, Vimeo, TikTok, X, or a direct video URL (.mp4, .webm).');
}
