import { Ratelimit, type RatelimitConfig } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { keys } from './keys';

const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = keys();

// Solo crear el cliente Redis si tenemos configuración
const redis = UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN
  ? new Redis({
    url: UPSTASH_REDIS_REST_URL,
    token: UPSTASH_REDIS_REST_TOKEN,
  })
  : undefined;

// Implementación en memoria simplificada para cuando Redis no está disponible
const inMemoryStore = new Map<string, { count: number, expires: number }>();

export const createRateLimiter = (props: Omit<RatelimitConfig, 'redis'>) => {
  // Si tenemos Redis, usar la implementación normal
  if (redis) {
    return new Ratelimit({
      redis,
      limiter: props.limiter ?? Ratelimit.slidingWindow(10, '10 s'),
      prefix: props.prefix ?? 'next-forge',
    });
  }

  // Implementación simplificada cuando no hay Redis
  return {
    limit: async () => ({ success: true, limit: 0, remaining: 999, reset: 0 })
  };
};

export const { slidingWindow } = Ratelimit;
