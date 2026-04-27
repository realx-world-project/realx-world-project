import { Ratelimit } from "@upstash/ratelimit";
import redis from "@/lib/redis";

export async function rateLimitByIP(identifier: string, limit: number, windowStr: string) {
  const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, windowStr as any),
    analytics: true,
  });

  const result = await ratelimit.limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
  };
}