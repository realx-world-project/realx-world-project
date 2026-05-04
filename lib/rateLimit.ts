export async function rateLimitByIP(identifier: string, limit: number, windowStr: string) {
  if (process.env.DISABLE_REDIS === "true") {
    return { success: true, remaining: 999 };
  }

  const { Ratelimit } = await import("@upstash/ratelimit");
  const { default: redis } = await import("@/lib/redis");

  const ratelimit = new Ratelimit({
    redis: redis as any,
    limiter: Ratelimit.slidingWindow(limit, windowStr as any),
    analytics: true,
  });

  const result = await ratelimit.limit(identifier);
  return {
    success: result.success,
    remaining: result.remaining,
  };
}
