import { MediaFormat, AnalyzeResult } from '../../types.ts';
import { safeFetch } from '../security.ts';

export function isRedditUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return host.includes('reddit.com') || host.includes('redd.it');
  } catch {
    return false;
  }
}

export async function handleReddit(url: string): Promise<AnalyzeResult | null> {
  if (!isRedditUrl(url)) return null;

  try {
    const cleanUrl = url.split('?')[0].replace(/\/+$/, '');
    const jsonUrl = `${cleanUrl}.json?raw_json=1`;

    const res = await safeFetch(jsonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    }, 10000);

    if (!res.ok) {
      return {
        platform: 'Reddit',
        platformId: 'reddit',
        platformIcon: 'reddit',
        title: 'Reddit Post Media',
        sourceUrl: url,
        thumbnail: '',
        status: 'restricted',
        restrictionReason: 'Reddit API returned status ' + res.status + '. The post may be private, NSFW, or deleted.',
        availableFormats: [],
        extractedAt: new Date().toISOString(),
      };
    }

    const data = await res.json();
    const postData = data?.[0]?.data?.children?.[0]?.data;

    if (!postData) {
      return {
        platform: 'Reddit',
        platformId: 'reddit',
        platformIcon: 'reddit',
        title: 'Reddit Media',
        sourceUrl: url,
        thumbnail: '',
        status: 'restricted',
        restrictionReason: 'Could not find media content in this Reddit submission.',
        availableFormats: [],
        extractedAt: new Date().toISOString(),
      };
    }

    const title = postData.title || 'Reddit Video';
    const author = `u/${postData.author || 'reddit_user'}`;
    const authorUrl = `https://www.reddit.com/user/${postData.author}`;
    const thumbnail = postData.thumbnail && postData.thumbnail.startsWith('http')
      ? postData.thumbnail
      : (postData.preview?.images?.[0]?.source?.url || '');

    // Check for Reddit Video
    const redditVideo = postData.secure_media?.reddit_video || postData.media?.reddit_video;
    const crosspostVideo = postData.crosspost_parent_list?.[0]?.secure_media?.reddit_video;
    const video = redditVideo || crosspostVideo;

    const availableFormats: MediaFormat[] = [];

    if (video && video.fallback_url) {
      const fallbackUrl = video.fallback_url;
      const height = video.height || 720;
      const durationSeconds = video.duration || 0;
      const durationStr = durationSeconds > 0 ? `${Math.floor(durationSeconds / 60)}:${String(durationSeconds % 60).padStart(2, '0')}` : undefined;

      // Extract available resolution streams
      const baseUrl = fallbackUrl.split('?')[0]; // e.g. https://v.redd.it/xxxx/DASH_720.mp4
      const basePath = baseUrl.substring(0, baseUrl.lastIndexOf('/')); // https://v.redd.it/xxxx

      // Reddit standard resolutions: 1080, 720, 480, 360, 240
      const standardResolutions = [1080, 720, 480, 360, 240].filter(r => r <= height);

      for (const resHeight of standardResolutions) {
        const streamUrl = `${basePath}/DASH_${resHeight}.mp4`;
        availableFormats.push({
          id: `reddit-mp4-${resHeight}`,
          format: 'mp4',
          quality: `${resHeight}p ${resHeight >= 720 ? 'HD' : 'SD'}`,
          resolution: `${Math.round(resHeight * (16 / 9))}x${resHeight}`,
          isAudioOnly: false,
          hasAudio: true,
          hasVideo: true,
          filesizeEstimate: durationSeconds ? `~${Math.round((resHeight * 2.5 * durationSeconds) / 8000)} MB` : 'Progressive Stream',
          mimeType: 'video/mp4',
          directStreamUrl: streamUrl,
          note: resHeight === height ? 'Original Reddit Video Master' : 'Encoded Stream',
        });
      }

      // Add default fallback MP4
      if (availableFormats.length === 0) {
        availableFormats.push({
          id: 'reddit-mp4-fallback',
          format: 'mp4',
          quality: `${height}p Video`,
          resolution: `${video.width || 1280}x${height}`,
          isAudioOnly: false,
          hasAudio: true,
          hasVideo: true,
          filesizeEstimate: 'Progressive Stream',
          mimeType: 'video/mp4',
          directStreamUrl: fallbackUrl,
        });
      }

      // Audio stream from Reddit DASH
      availableFormats.push({
        id: 'reddit-audio-m4a',
        format: 'm4a',
        quality: 'Reddit Audio Track (DASH)',
        resolution: 'Audio Only',
        isAudioOnly: true,
        hasAudio: true,
        hasVideo: false,
        filesizeEstimate: durationSeconds ? `~${Math.max(1, Math.round(durationSeconds * 0.016))} MB` : '~2 MB',
        mimeType: 'audio/mp4',
        directStreamUrl: `${basePath}/DASH_audio.mp4`,
        note: 'Direct Reddit audio stream',
      });

      return {
        platform: 'Reddit',
        platformId: 'reddit',
        platformIcon: 'reddit',
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
    }

    // Check if post contains direct link to external video (e.g. gfycat, imgur, or mp4)
    if (postData.url && postData.url.match(/\.(mp4|webm|mov)$/i)) {
      availableFormats.push({
        id: 'reddit-linked-mp4',
        format: 'mp4',
        quality: 'High Definition',
        resolution: 'Source Resolution',
        isAudioOnly: false,
        hasAudio: true,
        hasVideo: true,
        filesizeEstimate: 'Direct Stream',
        mimeType: 'video/mp4',
        directStreamUrl: postData.url,
      });

      return {
        platform: 'Reddit',
        platformId: 'reddit',
        platformIcon: 'reddit',
        title,
        author,
        authorUrl,
        thumbnail,
        sourceUrl: url,
        availableFormats,
        status: 'ready',
        extractedAt: new Date().toISOString(),
      };
    }

    return {
      platform: 'Reddit',
      platformId: 'reddit',
      platformIcon: 'reddit',
      title,
      author,
      thumbnail,
      sourceUrl: url,
      status: 'restricted',
      restrictionReason: 'This Reddit submission does not host an authorized video media track.',
      availableFormats: [],
      extractedAt: new Date().toISOString(),
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown Reddit parsing error';
    return {
      platform: 'Reddit',
      platformId: 'reddit',
      platformIcon: 'reddit',
      title: 'Reddit Media',
      sourceUrl: url,
      thumbnail: '',
      status: 'restricted',
      restrictionReason: `Error extracting Reddit media: ${errorMsg}`,
      availableFormats: [],
      extractedAt: new Date().toISOString(),
    };
  }
}
