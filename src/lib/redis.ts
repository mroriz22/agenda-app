import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { __redis?: Redis };

export function redis(): Redis {
  if (!globalForRedis.__redis) {
    const url = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
    globalForRedis.__redis = new Redis(url, {
      maxRetriesPerRequest: 2,
      lazyConnect: true,
    });
  }
  return globalForRedis.__redis;
}

export function redisKey(suffix: string): string {
  const prefix = process.env.REDIS_PREFIX ?? "saas:";
  return `${prefix}${suffix}`;
}
