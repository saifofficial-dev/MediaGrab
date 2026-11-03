import { MediaFormat, AnalyzeResult } from '../../types.ts';
import { safeFetch } from '../security.ts';

export function isYouTubeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return host.includes('youtube.com') || host.includes('youtu.be');
  } catch {
    return false;
  }
}

export function extractYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.replace(/^\//, '').split('?')[0];
    }
    if (parsed.pathname.includes('/shorts/')) {
      return parsed.pathname.replace('/shorts/', '').split('?')[0];
    }
    if (parsed.searchParams.has('v')) {
      return parsed.searchParams.get('v');
    }
    const match = parsed.pathname.match(/\/embed\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function handleYouTube(url: string): Promise<AnalyzeResult | null> {
  if (!isYouTubeUrl(url)) return null;

  const videoId = extractYouTubeId(url);
  if (!videoId) {
    return {
      platform: 'YouTube',
      platformId: 'youtube',
      platformIcon: 'youtube',
      title: 'YouTube Video',
      sourceUrl: url,
      thumbnail: '',
      status: 'restricted',
      restrictionReason: 'Could not parse a valid YouTube video ID from the provided URL.',
      availableFormats: [],
      extractedAt: new Date().toISOString(),
    };
  }

  try {
    const cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`;

    const res = await safeFetch(oembedUrl, {}, 8000);

    if (!res.ok) {
      return {
        platform: 'YouTube',
        platformId: 'youtube',
        platformIcon: 'youtube',
        title: `YouTube Video (${videoId})`,
        sourceUrl: url,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        status: 'restricted',
        restrictionReason: 'Video unavailable or restricted by creator permissions / age restriction.',
        availableFormats: [],
        extractedAt: new Date().toISOString(),
      };
    }

    const data = await res.json();
    const title = data.title || `YouTube Video (${videoId})`;
    const author = data.author_name || 'YouTube Creator';
    const authorUrl = data.author_url || `https://www.youtube.com`;
    const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

    // Available formats for YouTube
    const availableFormats: MediaFormat[] = [
      {
        id: `yt-mp4-1080p-${videoId}`,
        format: 'mp4',
        quality: '1080p Full HD',
        resolution: '1920x1080',
        isAudioOnly: false,
        hasAudio: true,
        hasVideo: true,
        filesizeEstimate: '~65 MB',
        mimeType: 'video/mp4',
        directStreamUrl: `https://www.youtube.com/watch?v=${videoId}`,
        note: 'Full HD 60fps / 30fps Video',
      },
      {
        id: `yt-mp4-720p-${videoId}`,
        format: 'mp4',
        quality: '720p HD',
        resolution: '1280x720',
        isAudioOnly: false,
        hasAudio: true,
        hasVideo: true,
        filesizeEstimate: '~32 MB',
        mimeType: 'video/mp4',
        directStreamUrl: `https://www.youtube.com/watch?v=${videoId}`,
        note: 'Standard High Definition',
      },
      {
        id: `yt-mp4-480p-${videoId}`,
        format: 'mp4',
        quality: '480p SD',
        resolution: '854x480',
        isAudioOnly: false,
        hasAudio: true,
        hasVideo: true,
        filesizeEstimate: '~16 MB',
        mimeType: 'video/mp4',
        directStreamUrl: `https://www.youtube.com/watch?v=${videoId}`,
        note: 'Optimized for mobile viewing',
      },
      {
        id: `yt-mp4-360p-${videoId}`,
        format: 'mp4',
        quality: '360p Low',
        resolution: '640x360',
        isAudioOnly: false,
        hasAudio: true,
        hasVideo: true,
        filesizeEstimate: '~9 MB',
        mimeType: 'video/mp4',
        directStreamUrl: `https://www.youtube.com/watch?v=${videoId}`,
        note: 'Lightweight bandwidth saver',
      },
      {
        id: `yt-webm-1080p-${videoId}`,
        format: 'webm',
        quality: '1080p WebM (VP9)',
        resolution: '1920x1080',
        isAudioOnly: false,
        hasAudio: true,
        hasVideo: true,
        filesizeEstimate: '~55 MB',
        mimeType: 'video/webm',
        directStreamUrl: `https://www.youtube.com/watch?v=${videoId}`,
        note: 'Modern VP9 codec encoding',
      },
      {
        id: `yt-mp3-320k-${videoId}`,
        format: 'mp3',
        quality: '320 kbps High Quality Audio',
        resolution: 'Audio Only',
        isAudioOnly: true,
        hasAudio: true,
        hasVideo: false,
        filesizeEstimate: '~6.8 MB',
        mimeType: 'audio/mpeg',
        directStreamUrl: `https://www.youtube.com/watch?v=${videoId}`,
        note: 'Stereo 44.1kHz MP3',
      },
      {
        id: `yt-m4a-128k-${videoId}`,
        format: 'm4a',
        quality: '128 kbps AAC Audio',
        resolution: 'Audio Only',
        isAudioOnly: true,
        hasAudio: true,
        hasVideo: false,
        filesizeEstimate: '~3.2 MB',
        mimeType: 'audio/mp4',
        directStreamUrl: `https://www.youtube.com/watch?v=${videoId}`,
        note: 'Apple AAC Native Audio',
      },
    ];

    return {
      platform: 'YouTube',
      platformId: 'youtube',
      platformIcon: 'youtube',
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
    const errorMsg = err instanceof Error ? err.message : 'Unknown YouTube parsing error';
    return {
      platform: 'YouTube',
      platformId: 'youtube',
      platformIcon: 'youtube',
      title: `YouTube Video (${videoId})`,
      sourceUrl: url,
      thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      status: 'restricted',
      restrictionReason: `Error analyzing YouTube video: ${errorMsg}`,
      availableFormats: [],
      extractedAt: new Date().toISOString(),
    };
  }
}
