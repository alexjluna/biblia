/**
 * Simple in-memory rate limiter.
 * Suitable for single-process deployment (PM2 single instance).
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (now > entry.resetAt) buckets.delete(key);
  }
}, 10 * 60 * 1000);

/**
 * Check if an action is rate limited.
 * @returns true if allowed, false if rate limited.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  entry.count++;
  return entry.count <= maxRequests;
}

// Preset rate limit checkers
const HOUR = 60 * 60 * 1000;

export function canCreateDiscussion(userId: string): boolean {
  return checkRateLimit(`discussion:create:${userId}`, 5, HOUR);
}

export function canPostMessage(userId: string): boolean {
  return checkRateLimit(`discussion:message:${userId}`, 20, HOUR);
}

export function canLike(userId: string): boolean {
  return checkRateLimit(`discussion:like:${userId}`, 60, HOUR);
}
