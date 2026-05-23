import Redis from 'ioredis'

export interface RedisCacheConfig {
  host: string
  port: number
  password?: string
  db: number
  maxRetriesPerRequest: number
  enableReadyCheck: boolean
  enableOfflineQueue: boolean
}

export const redisConfig: RedisCacheConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  enableOfflineQueue: false,
}

let redis: Redis | null = null

export function initRedis(): Redis {
  if (!redis) {
    redis = new Redis(redisConfig)
    redis.on('connect', () => {
      console.log('[v0] Redis connected')
    })
    redis.on('error', (error) => {
      console.error('[v0] Redis error:', error)
    })
  }
  return redis
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = initRedis()
  const data = await client.get(key)
  return data ? JSON.parse(data) : null
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
  const client = initRedis()
  await client.setex(key, ttlSeconds, JSON.stringify(value))
}

export async function cacheDel(key: string): Promise<void> {
  const client = initRedis()
  await client.del(key)
}

export async function cacheIncrementCounter(key: string, ttlSeconds: number = 3600): Promise<number> {
  const client = initRedis()
  const count = await client.incr(key)
  await client.expire(key, ttlSeconds)
  return count
}

export async function getRateLimitStatus(key: string, limit: number, windowSeconds: number): Promise<{
  remaining: number
  resetAt: number
}> {
  const client = initRedis()
  const current = await client.incr(key)
  const ttl = await client.ttl(key)

  if (ttl === -1) {
    await client.expire(key, windowSeconds)
  }

  return {
    remaining: Math.max(0, limit - current),
    resetAt: Math.floor(Date.now() / 1000) + windowSeconds,
  }
}

export async function flushCache(pattern?: string): Promise<number> {
  const client = initRedis()
  if (pattern) {
    const keys = await client.keys(pattern)
    if (keys.length > 0) {
      return await client.del(...keys)
    }
    return 0
  }
  await client.flushdb()
  return 1
}

export async function getRedisStats(): Promise<any> {
  const client = initRedis()
  const info = await client.info('stats')
  const memoryInfo = await client.info('memory')
  return {
    connected_clients: info.connected_clients,
    total_commands_processed: info.total_commands_processed,
    used_memory_human: memoryInfo.used_memory_human,
    maxmemory_human: memoryInfo.maxmemory_human,
  }
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit()
    redis = null
  }
}
