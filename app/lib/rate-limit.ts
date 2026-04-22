import { headers } from 'next/headers'

interface RateLimitEntry {
  count: number
  resetTime: number
}

const store = new Map<string, RateLimitEntry>()

export async function getClientIp(): Promise<string> {
  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return 'unknown'
}

export function checkRateLimit(
  key: string,
  windowMs: number = 60_000,
  maxRequests: number = 5
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now()

  // Lazy cleanup: remove expired entries to prevent memory leaks
  for (const [k, v] of store.entries()) {
    if (now > v.resetTime) {
      store.delete(k)
    }
  }

  const record = store.get(key)

  if (!record || now > record.resetTime) {
    const resetTime = now + windowMs
    store.set(key, { count: 1, resetTime })
    return { success: true, remaining: maxRequests - 1, resetTime }
  }

  if (record.count >= maxRequests) {
    return { success: false, remaining: 0, resetTime: record.resetTime }
  }

  record.count++
  return {
    success: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  }
}

export async function rateLimitByIp(
  identifier: string,
  windowMs: number = 60_000,
  maxRequests: number = 5
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  const ip = await getClientIp()
  const key = `${identifier}:${ip}`
  return checkRateLimit(key, windowMs, maxRequests)
}
