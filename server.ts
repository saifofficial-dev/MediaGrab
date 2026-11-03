import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { validateSafeUrl, sanitizeFilename, createRateLimiter, safeFetch } from './src/server/security.ts';
import { analyzeMediaUrl, SAMPLE_VIDEOS, SUPPORTED_PLATFORMS } from './src/server/adapters/index.ts';
import { Readable } from 'stream';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Parse JSON bodies (limit to 1mb to prevent payload exhaustion)
  app.use(express.json({ limit: '1mb' }));

  // Security Headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Rate limiters
  const analyzeLimiter = createRateLimiter(40, 60000); // 40 analyze requests per minute
  const downloadLimiter = createRateLimiter(25, 60000); // 25 downloads per minute

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'MediaGrab Universal Downloader API',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      adapters: SUPPORTED_PLATFORMS.map(p => ({
        id: p.id,
        name: p.name,
        status: p.status,
      })),
    });
  });

  // Sample videos and platform matrix endpoint
  app.get('/api/samples', (req: Request, res: Response) => {
    res.json({
      samples: SAMPLE_VIDEOS,
      platforms: SUPPORTED_PLATFORMS,
    });
  });

  // POST /api/analyze - Analyze any social media or direct video URL
  app.post('/api/analyze', analyzeLimiter, async (req: Request, res: Response) => {
    const { url } = req.body;

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return res.status(400).json({
        error: 'Invalid Request',
        message: 'A valid video URL is required.',
      });
    }

    const trimmedUrl = url.trim();

    // 1. SSRF Validation
    const urlValidation = await validateSafeUrl(trimmedUrl);
    if (!urlValidation.valid) {
      return res.status(400).json({
        error: 'Security Validation Failed',
        message: urlValidation.error || 'The requested URL cannot be processed due to safety constraints.',
      });
    }

    try {
      // 2. Dispatch to platform adapter
      const mediaInfo = await analyzeMediaUrl(trimmedUrl);
      return res.json(mediaInfo);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to analyze video URL';
      return res.status(422).json({
        error: 'Analysis Failed',
        message,
      });
    }
  });

  // POST or GET /api/download - Stream media safely to client with proper Content-Disposition
  const handleDownload = async (req: Request, res: Response) => {
    const rawUrl = (req.body?.streamUrl || req.body?.url || req.query?.url || req.query?.streamUrl) as string;
    const formatId = (req.body?.formatId || req.query?.formatId || 'default') as string;
    const rawTitle = (req.body?.title || req.query?.title || 'media_download') as string;
    const ext = (req.body?.format || req.query?.format || 'mp4') as string;

    if (!rawUrl || typeof rawUrl !== 'string') {
      return res.status(400).json({
        error: 'Invalid Request',
        message: 'Missing media stream URL for download.',
      });
    }

    // SSRF Check on media target
    const validation = await validateSafeUrl(rawUrl);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Security Error',
        message: validation.error || 'The media URL is blocked by security policy.',
      });
    }

    const safeFilename = sanitizeFilename(`${rawTitle}_${formatId}.${ext}`, ext);

    try {
      // Stream directly from authorized source
      const upstreamRes = await safeFetch(rawUrl, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 MediaGrab/1.0',
        },
      }, 30000);

      if (!upstreamRes.ok || !upstreamRes.body) {
        return res.status(upstreamRes.status || 502).json({
          error: 'Download Failed',
          message: `The upstream server responded with status ${upstreamRes.status}. Media could not be streamed.`,
        });
      }

      // Relay headers
      const contentType = upstreamRes.headers.get('content-type') || (ext === 'mp3' ? 'audio/mpeg' : 'video/mp4');
      const contentLength = upstreamRes.headers.get('content-length');

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
      if (contentLength) {
        res.setHeader('Content-Length', contentLength);
      }
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

      // Convert Web Stream to Node.js Readable stream and pipe to express response
      const nodeStream = Readable.fromWeb(upstreamRes.body as import('stream/web').ReadableStream);

      // Handle client disconnect gracefully
      req.on('close', () => {
        nodeStream.destroy();
      });

      nodeStream.on('error', (streamErr) => {
        console.error('Streaming error:', streamErr);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Streaming interrupted' });
        }
      });

      nodeStream.pipe(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error processing download stream';
      if (!res.headersSent) {
        return res.status(500).json({
          error: 'Download Error',
          message,
        });
      }
    }
  };

  app.post('/api/download', downloadLimiter, handleDownload);
  app.get('/api/download', downloadLimiter, handleDownload);

  // Vite integration in development or static serving in production
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MediaGrab server running on http://0.0.0.0:${PORT} [${isProd ? 'production' : 'development'}]`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
