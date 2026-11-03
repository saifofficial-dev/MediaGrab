import { MediaFormat, AnalyzeResult } from '../../types.ts';
import { safeFetch } from '../security.ts';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export async function handleDirectMedia(url: string): Promise<AnalyzeResult | null> {
  const parsed = new URL(url);
  const pathname = parsed.pathname.toLowerCase();
  const directExtensions = ['.mp4', '.webm', '.mov', '.mp3', '.m4a', '.wav', '.ogg'];

  const hasMediaExt = directExtensions.some(ext => pathname.endsWith(ext));

  // Perform HEAD request to check content type and size
  let contentLength = 0;
  let contentType = '';
  let isMediaContentType = false;

  try {
    let headRes = await safeFetch(url, { method: 'HEAD' }, 8000);
    contentType = headRes.headers.get('content-type') || '';
    const lengthHeader = headRes.headers.get('content-length');
    if (lengthHeader) {
      contentLength = parseInt(lengthHeader, 10) || 0;
    }

    // If HEAD didn't yield media or length, try a 1-byte Range GET request
    if (contentLength === 0 || !contentType.includes('video/') && !contentType.includes('audio/')) {
      const rangeRes = await safeFetch(url, {
        method: 'GET',
        headers: { 'Range': 'bytes=0-1' },
      }, 8000);

      const rangeHeader = rangeRes.headers.get('content-range'); // e.g. "bytes 0-1/158008374"
      if (rangeHeader) {
        const parts = rangeHeader.split('/');
        if (parts.length > 1) {
          contentLength = parseInt(parts[1], 10) || 0;
        }
      }
      const rangeType = rangeRes.headers.get('content-type');
      if (rangeType && (rangeType.includes('video/') || rangeType.includes('audio/'))) {
        contentType = rangeType;
      }
    }

    if (
      contentType.includes('video/') ||
      contentType.includes('audio/') ||
      contentType.includes('application/ogg')
    ) {
      isMediaContentType = true;
    }
  } catch {
    // If requests fail, rely on extension check
    if (!hasMediaExt) return null;
  }

  // Fallback MIME mapping if server sent generic/xml header for a known extension
  if (pathname.endsWith('.mp4')) contentType = 'video/mp4';
  if (pathname.endsWith('.webm')) contentType = 'video/webm';
  if (pathname.endsWith('.mov')) contentType = 'video/quicktime';
  if (pathname.endsWith('.mp3')) contentType = 'audio/mpeg';
  if (pathname.endsWith('.m4a')) contentType = 'audio/mp4';

  if (!hasMediaExt && !isMediaContentType) {
    return null;
  }

  // Determine media characteristics
  const isAudio = contentType.includes('audio/') || pathname.endsWith('.mp3') || pathname.endsWith('.m4a') || pathname.endsWith('.wav');
  const filename = pathname.split('/').pop()?.split('?')[0] || 'Media Video';
  const cleanTitle = decodeURIComponent(filename)
    .replace(/[_-]+/g, ' ')
    .replace(/\.[a-z0-9]+$/i, '');

  const availableFormats: MediaFormat[] = [];
  const sizeEstimate = contentLength > 0 ? formatBytes(contentLength) : 'Dynamic stream';

  if (isAudio) {
    availableFormats.push({
      id: 'direct-audio-orig',
      format: (pathname.endsWith('.mp3') ? 'mp3' : pathname.endsWith('.m4a') ? 'm4a' : 'mp3'),
      quality: 'Original Audio Quality',
      resolution: 'Audio Only',
      isAudioOnly: true,
      hasAudio: true,
      hasVideo: false,
      filesizeEstimate: sizeEstimate,
      filesizeBytes: contentLength > 0 ? contentLength : undefined,
      mimeType: contentType || 'audio/mpeg',
      directStreamUrl: url,
      note: 'Direct streaming source',
    });
  } else {
    // Determine video formats
    const ext = pathname.endsWith('.webm') ? 'webm' : pathname.endsWith('.mov') ? 'mov' : 'mp4';
    availableFormats.push({
      id: 'direct-video-original',
      format: ext,
      quality: 'Original Quality (Master)',
      resolution: 'Source Resolution',
      isAudioOnly: false,
      hasAudio: true,
      hasVideo: true,
      filesizeEstimate: sizeEstimate,
      filesizeBytes: contentLength > 0 ? contentLength : undefined,
      mimeType: contentType || 'video/mp4',
      directStreamUrl: url,
      note: 'Lossless direct server stream',
    });

    // Provide MP3 audio rip option for video
    availableFormats.push({
      id: 'direct-audio-extract',
      format: 'mp3',
      quality: 'Extracted Audio Track',
      resolution: 'Audio Only',
      isAudioOnly: true,
      hasAudio: true,
      hasVideo: false,
      filesizeEstimate: contentLength > 0 ? formatBytes(Math.round(contentLength * 0.15)) : '~5 MB',
      mimeType: 'audio/mpeg',
      directStreamUrl: url,
      note: 'Audio stream extraction',
    });
  }

  return {
    platform: 'Direct Media Link',
    platformId: 'direct',
    platformIcon: 'video',
    title: cleanTitle || 'Direct Media File',
    author: parsed.hostname,
    authorUrl: `${parsed.protocol}//${parsed.hostname}`,
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    sourceUrl: url,
    availableFormats,
    status: 'ready',
    extractedAt: new Date().toISOString(),
  };
}
