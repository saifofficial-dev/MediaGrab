import { MediaFormat, AnalyzeResult } from '../../types.ts';
import { safeFetch } from '../security.ts';

export function isDailymotionUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return host.includes('dailymotion.com') || host.includes('dai.ly');
  } catch {
    return false;
  }
}

export function extractDailymotionId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('dai.ly')) {
      return parsed.pathname.replace(/^\//, '').split('?')[0];
    }
    const match = parsed.pathname.match(/\/video\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

export async function handleDailymotion(url: string): Promise<AnalyzeResult | null> {
  if (!isDailymotionUrl(url)) return null;

  const videoId = extractDailymotionId(url);
  if (!videoId) {
    return {
      platform: 'Dailymotion',
      platformId: 'dailymotion',
      platformIcon: 'video',
      title: 'Dailymotion Video',
      sourceUrl: url,
      thumbnail: '',
      status: 'restricted',
      restrictionReason: 'Could not extract valid Dailymotion video ID from URL.',
      availableFormats: [],
      extractedAt: new Date().toISOString(),
    };
  }

  try {
    const apiUrl = `https://api.dailymotion.com/video/${videoId}?fields=id,title,description,duration,thumbnail_720_url,thumbnail_large_url,owner.screenname,owner.url,status`;
    const res = await safeFetch(apiUrl, {}, 8000);

    if (!res.ok) {
      return {
        platform: 'Dailymotion',
        platformId: 'dailymotion',
        platformIcon: 'video',
        title: 'Dailymotion Video',
        sourceUrl: url,
        thumbnail: '',
        status: 'restricted',
        restrictionReason: 'Dailymotion video not found or marked private.',
        availableFormats: [],
        extractedAt: new Date().toISOString(),
      };
    }

    const data = await res.json();
    const title = data.title || 'Dailymotion Video';
    const author = data['owner.screenname'] || 'Dailymotion Creator';
    const authorUrl = data['owner.url'] || 'https://www.dailymotion.com';
    const thumbnail = data.thumbnail_720_url || data.thumbnail_large_url || '';
    const durationSeconds = data.duration || 0;
    const durationStr = durationSeconds > 0 ? `${Math.floor(durationSeconds / 60)}:${String(durationSeconds % 60).padStart(2, '0')}` : undefined;

    // Dailymotion formats
    const availableFormats: MediaFormat[] = [
      {
        id: 'dm-mp4-1080p',
        format: 'mp4',
        quality: '1080p Full HD',
        resolution: '1920x1080',
        isAudioOnly: false,
        hasAudio: true,
        hasVideo: true,
        filesizeEstimate: durationSeconds ? `~${Math.round((durationSeconds * 3.5) / 8)} MB` : '~35 MB',
        mimeType: 'video/mp4',
        directStreamUrl: `https://www.dailymotion.com/embed/video/${videoId}`,
        note: 'Dailymotion HD Stream',
      },
      {
        id: 'dm-mp4-720p',
        format: 'mp4',
        quality: '720p HD',
        resolution: '1280x720',
        isAudioOnly: false,
        hasAudio: true,
        hasVideo: true,
        filesizeEstimate: durationSeconds ? `~${Math.round((durationSeconds * 2.0) / 8)} MB` : '~20 MB',
        mimeType: 'video/mp4',
        directStreamUrl: `https://www.dailymotion.com/embed/video/${videoId}`,
        note: 'Standard stream',
      },
      {
        id: 'dm-mp4-480p',
        format: 'mp4',
        quality: '480p SD',
        resolution: '854x480',
        isAudioOnly: false,
        hasAudio: true,
        hasVideo: true,
        filesizeEstimate: durationSeconds ? `~${Math.round((durationSeconds * 1.1) / 8)} MB` : '~10 MB',
        mimeType: 'video/mp4',
        directStreamUrl: `https://www.dailymotion.com/embed/video/${videoId}`,
        note: 'Mobile-optimized stream',
      },
      {
        id: 'dm-mp3-audio',
        format: 'mp3',
        quality: 'Extracted Audio Track',
        resolution: 'Audio Only',
        isAudioOnly: true,
        hasAudio: true,
        hasVideo: false,
        filesizeEstimate: durationSeconds ? `~${Math.round((durationSeconds * 0.2) / 8)} MB` : '~3 MB',
        mimeType: 'audio/mpeg',
        directStreamUrl: `https://www.dailymotion.com/embed/video/${videoId}`,
        note: 'Audio MP3 track',
      },
    ];

    return {
      platform: 'Dailymotion',
      platformId: 'dailymotion',
      platformIcon: 'video',
      title,
      author,
      authorUrl,
      thumbnail,
      duration: durationStr,
      durationSeconds,
      sourceUrl: url,
      availableFormats,
      status: 'ready',
      extractedAt: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown Dailymotion parsing error';
    return {
      platform: 'Dailymotion',
      platformId: 'dailymotion',
      platformIcon: 'video',
      title: 'Dailymotion Video',
      sourceUrl: url,
      thumbnail: '',
      status: 'restricted',
      restrictionReason: `Error extracting Dailymotion video: ${errorMsg}`,
      availableFormats: [],
      extractedAt: new Date().toISOString(),
    };
  }
}
