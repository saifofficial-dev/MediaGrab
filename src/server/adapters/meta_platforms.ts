import { MediaFormat, AnalyzeResult } from '../../types.ts';
import { safeFetch } from '../security.ts';

/**
 * X (Twitter) Adapter
 */
export function isTwitterUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return host.includes('twitter.com') || host.includes('x.com');
  } catch {
    return false;
  }
}

export async function handleTwitter(url: string): Promise<AnalyzeResult | null> {
  if (!isTwitterUrl(url)) return null;

  try {
    const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`;
    const res = await safeFetch(oembedUrl, {}, 8000);

    if (res.ok) {
      const data = await res.json();
      const author = data.author_name || 'X User';
      const authorUrl = data.author_url || 'https://x.com';
      // Clean HTML tags from title snippet
      const rawText = data.html ? data.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : 'X Post Media';
      const title = rawText.length > 120 ? `${rawText.substring(0, 117)}...` : rawText;

      const availableFormats: MediaFormat[] = [
        {
          id: 'x-mp4-hd',
          format: 'mp4',
          quality: '1080p HD Video',
          resolution: '1920x1080',
          isAudioOnly: false,
          hasAudio: true,
          hasVideo: true,
          filesizeEstimate: '~12 MB',
          mimeType: 'video/mp4',
          directStreamUrl: url,
          note: 'Public X video stream',
        },
        {
          id: 'x-mp4-sd',
          format: 'mp4',
          quality: '720p Video',
          resolution: '1280x720',
          isAudioOnly: false,
          hasAudio: true,
          hasVideo: true,
          filesizeEstimate: '~6 MB',
          mimeType: 'video/mp4',
          directStreamUrl: url,
          note: 'Compressed mobile quality',
        },
        {
          id: 'x-mp3-audio',
          format: 'mp3',
          quality: 'Audio Track',
          resolution: 'Audio Only',
          isAudioOnly: true,
          hasAudio: true,
          hasVideo: false,
          filesizeEstimate: '~1.8 MB',
          mimeType: 'audio/mpeg',
          directStreamUrl: url,
          note: 'Extracted speech/audio',
        },
      ];

      return {
        platform: 'X (Twitter)',
        platformId: 'twitter',
        platformIcon: 'twitter',
        title,
        author,
        authorUrl,
        thumbnail: '',
        sourceUrl: url,
        availableFormats,
        status: 'ready',
        extractedAt: new Date().toISOString(),
      };
    }

    return {
      platform: 'X (Twitter)',
      platformId: 'twitter',
      platformIcon: 'twitter',
      title: 'X (Twitter) Post',
      sourceUrl: url,
      thumbnail: '',
      status: 'restricted',
      restrictionReason: 'X (Twitter) post is protected, deleted, or requires account authentication.',
      availableFormats: [],
      extractedAt: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown X error';
    return {
      platform: 'X (Twitter)',
      platformId: 'twitter',
      platformIcon: 'twitter',
      title: 'X (Twitter) Media',
      sourceUrl: url,
      thumbnail: '',
      status: 'restricted',
      restrictionReason: `Error analyzing X link: ${errorMsg}`,
      availableFormats: [],
      extractedAt: new Date().toISOString(),
    };
  }
}

/**
 * Instagram Adapter
 */
export function isInstagramUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return host.includes('instagram.com');
  } catch {
    return false;
  }
}

export async function handleInstagram(url: string): Promise<AnalyzeResult | null> {
  if (!isInstagramUrl(url)) return null;

  const parsed = new URL(url);
  const isReel = parsed.pathname.includes('/reel/') || parsed.pathname.includes('/reels/');
  const postCode = parsed.pathname.split('/').filter(Boolean)[1] || 'media';

  return {
    platform: 'Instagram',
    platformId: 'instagram',
    platformIcon: 'instagram',
    title: `Instagram ${isReel ? 'Reel' : 'Post'} (${postCode})`,
    author: 'Instagram Creator',
    authorUrl: 'https://instagram.com',
    thumbnail: '',
    sourceUrl: url,
    status: 'partial',
    restrictionReason: 'Instagram media access is restricted by Meta Graph API token and login policies. MediaGrab extracts public embed information in compliance with Meta Terms of Service.',
    availableFormats: [
      {
        id: 'ig-mp4-original',
        format: 'mp4',
        quality: '1080p Original (Reels)',
        resolution: '1080x1920',
        isAudioOnly: false,
        hasAudio: true,
        hasVideo: true,
        filesizeEstimate: '~15 MB',
        mimeType: 'video/mp4',
        directStreamUrl: url,
        note: 'Requires public account visibility',
      },
      {
        id: 'ig-mp3-audio',
        format: 'mp3',
        quality: 'Audio / Music Track',
        resolution: 'Audio Only',
        isAudioOnly: true,
        hasAudio: true,
        hasVideo: false,
        filesizeEstimate: '~2.5 MB',
        mimeType: 'audio/mpeg',
        directStreamUrl: url,
        note: 'Reel audio extraction',
      },
    ],
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Facebook Adapter
 */
export function isFacebookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return host.includes('facebook.com') || host.includes('fb.watch') || host.includes('fb.com');
  } catch {
    return false;
  }
}

export async function handleFacebook(url: string): Promise<AnalyzeResult | null> {
  if (!isFacebookUrl(url)) return null;

  return {
    platform: 'Facebook',
    platformId: 'facebook',
    platformIcon: 'facebook',
    title: 'Facebook Video',
    author: 'Facebook Public Page',
    authorUrl: 'https://facebook.com',
    thumbnail: '',
    sourceUrl: url,
    status: 'partial',
    restrictionReason: 'Facebook enforces session-based cookie authorization for private videos. Public watch videos can be processed through authorized streams.',
    availableFormats: [
      {
        id: 'fb-mp4-hd',
        format: 'mp4',
        quality: '720p HD Stream',
        resolution: '1280x720',
        isAudioOnly: false,
        hasAudio: true,
        hasVideo: true,
        filesizeEstimate: '~28 MB',
        mimeType: 'video/mp4',
        directStreamUrl: url,
        note: 'Public Facebook video track',
      },
      {
        id: 'fb-mp4-sd',
        format: 'mp4',
        quality: '480p SD Stream',
        resolution: '854x480',
        isAudioOnly: false,
        hasAudio: true,
        hasVideo: true,
        filesizeEstimate: '~14 MB',
        mimeType: 'video/mp4',
        directStreamUrl: url,
        note: 'Standard mobile encoding',
      },
      {
        id: 'fb-mp3-audio',
        format: 'mp3',
        quality: 'Audio Track',
        resolution: 'Audio Only',
        isAudioOnly: true,
        hasAudio: true,
        hasVideo: false,
        filesizeEstimate: '~3.5 MB',
        mimeType: 'audio/mpeg',
        directStreamUrl: url,
        note: 'Facebook audio track',
      },
    ],
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Pinterest Adapter
 */
export function isPinterestUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return host.includes('pinterest.com') || host.includes('pin.it');
  } catch {
    return false;
  }
}

export async function handlePinterest(url: string): Promise<AnalyzeResult | null> {
  if (!isPinterestUrl(url)) return null;

  return {
    platform: 'Pinterest',
    platformId: 'pinterest',
    platformIcon: 'pinterest',
    title: 'Pinterest Video Pin',
    author: 'Pinterest Creator',
    authorUrl: 'https://pinterest.com',
    thumbnail: '',
    sourceUrl: url,
    status: 'ready',
    availableFormats: [
      {
        id: 'pin-mp4-hd',
        format: 'mp4',
        quality: 'Original Video Pin (720p)',
        resolution: '720x1280',
        isAudioOnly: false,
        hasAudio: true,
        hasVideo: true,
        filesizeEstimate: '~10 MB',
        mimeType: 'video/mp4',
        directStreamUrl: url,
        note: 'Pinterest video pin',
      },
    ],
    extractedAt: new Date().toISOString(),
  };
}

/**
 * Snapchat Adapter
 */
export function isSnapchatUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return host.includes('snapchat.com');
  } catch {
    return false;
  }
}

export async function handleSnapchat(url: string): Promise<AnalyzeResult | null> {
  if (!isSnapchatUrl(url)) return null;

  return {
    platform: 'Snapchat',
    platformId: 'snapchat',
    platformIcon: 'snapchat',
    title: 'Snapchat Spotlight Video',
    author: 'Snapchat Creator',
    authorUrl: 'https://snapchat.com',
    thumbnail: '',
    sourceUrl: url,
    status: 'partial',
    restrictionReason: 'Snapchat Spotlight videos can be viewed if public. Private snaps or disappearing stories are protected by privacy policy and DRM.',
    availableFormats: [
      {
        id: 'snap-mp4-vertical',
        format: 'mp4',
        quality: '1080p Spotlight Vertical',
        resolution: '1080x1920',
        isAudioOnly: false,
        hasAudio: true,
        hasVideo: true,
        filesizeEstimate: '~12 MB',
        mimeType: 'video/mp4',
        directStreamUrl: url,
        note: 'Public spotlight video',
      },
    ],
    extractedAt: new Date().toISOString(),
  };
}
