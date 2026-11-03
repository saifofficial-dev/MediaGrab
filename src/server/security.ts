import dns from 'node:dns/promises';
import { Request, Response, NextFunction } from 'express';

// List of private IPv4 ranges
const PRIVATE_IPV4_PATTERNS = [
  /^127\./,                 // Loopback (127.0.0.0/8)
  /^10\./,                  // Private Class A (10.0.0.0/8)
  /^192\.168\./,            // Private Class C (192.168.0.0/16)
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private Class B (172.16.0.0/12)
  /^169\.254\./,            // Link-local (169.254.0.0/16)
  /^0\./,                   // Current network
  /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./, // Carrier-grade NAT (100.64.0.0/10)
  /^198\.18\./,             // Benchmark tests (198.18.0.0/15)
  /^198\.51\.100\./,        // TEST-NET-2
  /^203\.0\.113\./,         // TEST-NET-3
  /^224\./,                 // Multicast
  /^240\./,                 // Reserved
];

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
  'metadata',
  'instance-data',
  '169.254.169.254',
  'local',
]);

/**
 * Validates a URL against Server-Side Request Forgery (SSRF)
 * Ensures scheme is http or https and host is public
 */
export async function validateSafeUrl(rawUrl: string): Promise<{ valid: boolean; error?: string; parsedUrl?: URL }> {
  try {
    const parsed = new URL(rawUrl);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Only HTTP and HTTPS protocols are supported.' };
    }

    const hostname = parsed.hostname.toLowerCase().trim();

    // Check blocked exact hostnames
    if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.local') || hostname.endsWith('.internal')) {
      return { valid: false, error: 'Access to local or internal network targets is strictly prohibited.' };
    }

    // Check direct IPv4 format
    for (const pattern of PRIVATE_IPV4_PATTERNS) {
      if (pattern.test(hostname)) {
        return { valid: false, error: 'Target resolves to a private or reserved network address.' };
      }
    }

    // Check IPv6 loopback / unique local
    if (hostname === '::1' || hostname === '[::1]' || hostname.startsWith('fe80:') || hostname.startsWith('fc00:') || hostname.startsWith('fd00:')) {
      return { valid: false, error: 'Target resolves to a private IPv6 address.' };
    }

    // DNS Resolution check to prevent DNS Rebinding SSRF
    try {
      const addresses = await dns.lookup(hostname, { all: true });
      for (const addr of addresses) {
        for (const pattern of PRIVATE_IPV4_PATTERNS) {
          if (pattern.test(addr.address)) {
            return { valid: false, error: 'Target resolves to an internal IP address.' };
          }
        }
        if (addr.address === '127.0.0.1' || addr.address === '::1' || addr.address.startsWith('fe80:') || addr.address.startsWith('fc00:')) {
          return { valid: false, error: 'Target IP is restricted.' };
        }
      }
    } catch {
      // If DNS resolution fails, allow fetch to handle network error or fail safely
    }

    return { valid: true, parsedUrl: parsed };
  } catch {
    return { valid: false, error: 'Malformed URL provided. Please enter a valid URL.' };
  }
}

/**
 * Sanitizes a filename for safe HTTP Content-Disposition headers and file systems
 */
export function sanitizeFilename(filename: string, defaultExt = 'mp4'): string {
  if (!filename || filename.trim().length === 0) {
    return `media_${Date.now()}.${defaultExt}`;
  }

  // Remove dangerous characters, path traversal and control characters
  let clean = filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\.\.+/g, '')
    .replace(/\s+/g, '_')
    .trim();

  // Limit filename length to 100 characters to prevent header injection or OS limits
  if (clean.length > 80) {
    clean = clean.substring(0, 80);
  }

  if (!clean.includes('.')) {
    clean = `${clean}.${defaultExt}`;
  }

  return clean || `media_${Date.now()}.${defaultExt}`;
}

/**
 * In-memory sliding-window rate limiter
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (record.resetAt <= now) {
      rateLimitMap.delete(ip);
    }
  }
}, 300000);

export function createRateLimiter(maxRequests: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
    const now = Date.now();

    const record = rateLimitMap.get(ip);
    if (!record || record.resetAt <= now) {
      rateLimitMap.set(ip, {
        count: 1,
        resetAt: now + windowMs,
      });
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      return next();
    }

    if (record.count >= maxRequests) {
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('Retry-After', Math.ceil((record.resetAt - now) / 1000));
      res.status(429).json({
        error: 'Too Many Requests',
        message: 'You have exceeded the request rate limit. Please wait a few seconds and try again.',
      });
      return;
    }

    record.count++;
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - record.count));
    return next();
  };
}

/**
 * Safe fetch with abort timeout
 */
export async function safeFetch(url: string, options: RequestInit = {}, timeoutMs = 15000): Promise<globalThis.Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 MediaGrab/1.0',
        ...(options.headers || {}),
      },
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
