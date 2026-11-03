import { MediaFormat, AnalyzeResult } from '../../types.ts';
import { safeFetch } from '../security.ts';

export function isTikTokUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return host.includes('tiktok.com');
  } catch {
    return false;
  }
}

export async function handleTikTok(url: string): Promise<AnalyzeResult | null> {
  if (!isTikTokUrl(url)) return null;

  try {
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    const res = await safeFetch(oembedUrl, {}, 8000);

    if (!res.ok) {
      return {
        platform: 'TikTok',
        platformId: 'tiktok',
        platformIcon: 'tiktok',
        title: 'TikTok Video',
        sourceUrl: url,
        thumbnail: '',
        status: 'restricted',
        restrictionReason: 'TikTok video not found, private, or age-restricted.',
        availableFormats: [],
        extractedAt: new Date().toISOString(),
      };
    }

    const data = await res.json();
    const title = data.title || 'TikTok Short Video';
    const author = data.author_name ? `@${data.author_name}` : 'TikTok Creator';
    const authorUrl = data.author_url || 'https://www.tiktok.com';
    const thumbnail = data.thumbnail_url || '';

    const availableFormats: MediaFormat[] = [
      {
        id: 'tiktok-mp4-hd',
        format: 'mp4',
        quality: '1080p HD (Vertical)',
        resolution: '1080x1920',
        isAudioOnly: false,
        hasAudio: true,
        hasVideo: true,
        filesizeEstimate: '~18 MB',
        mimeType: 'video/mp4',
        directStreamUrl: url,
        note: 'High-definition vertical MP4 video',
      },
      {
        id: 'tiktok-mp4-sd',
        format: 'mp4',
        quality: '720p Mobile (Vertical)',
        resolution: '720x1280',
        isAudioOnly: false,
        hasAudio: true,
        hasVideo: true,
        filesizeEstimate: '~9 MB',
        mimeType: 'video/mp4',
        directStreamUrl: url,
        note: 'Compressed mobile stream',
      },
      {
        id: 'tiktok-mp3-sound',
        format: 'mp3',
        quality: 'Original Sound Track',
        resolution: 'Audio Only',
        isAudioOnly: true,
        hasAudio: true,
        hasVideo: false,
        filesizeEstimate: '~2.5 MB',
        mimeType: 'audio/mpeg',
        directStreamUrl: url,
        note: 'Background music / voice track',
      },
    ];

    return {
      platform: 'TikTok',
      platformId: 'tiktok',
      platformIcon: 'tiktok',
      title,
      author,
      authorUrl,
      thumbnail,
      sourceUrl: url,
      availableFormats,
      status: 'ready',
      extractedAt: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown TikTok parsing error';
    return {
      platform: 'TikTok',
      platformId: 'tiktok',
      platformIcon: 'tiktok',
      title: 'TikTok Video',
      sourceUrl: url,
      thumbnail: '',
      status: 'restricted',
      restrictionReason: `Error analyzing TikTok link: ${errorMsg}`,
      availableFormats: [],
      extractedAt: new Date().toISOString(),
    };
  }
}
