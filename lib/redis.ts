const mockRedis = {
  get: async () => null,
  set: async () => null,
  del: async () => null,
  ping: async () => "PONG",
  incr: async () => 1,
};

function createRedis() {
  const { Redis } = require("@upstash/redis");
  return new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL as string,
    token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
  });
}

export const redis =
  process.env.DISABLE_REDIS === "true" ? mockRedis : createRedis();

export default redis;
