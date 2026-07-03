import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Only create the ratelimiter if we have the Redis credentials
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Allow 5 requests per minute for auth routes
const authRatelimit = redis 
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '1 m'),
      analytics: true,
    })
  : null;

export async function rateLimitAuth(identifier: string) {
  if (!authRatelimit) {
    // If Redis is not configured (e.g. in local dev without Upstash), bypass rate limiting.
    console.warn('Rate limiter bypassed: Upstash Redis is not configured.');
    return { success: true };
  }
  
  return await authRatelimit.limit(identifier);
}
