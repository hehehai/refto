// KVNamespace type for Cloudflare Workers
// This is a simplified type that matches the actual Cloudflare KV API
export interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number }
  ): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface CacheOptions {
  ttl: number;
}

export class KVCache {
  private readonly kv: KVNamespace | undefined;

  constructor(kv: KVNamespace | undefined) {
    this.kv = kv;
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.kv) return null;
    const raw = await this.kv.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set<T>(key: string, data: T, options: CacheOptions): Promise<void> {
    if (!this.kv) return;
    await this.kv.put(key, JSON.stringify(data), {
      expirationTtl: options.ttl,
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.kv) return;
    await this.kv.delete(key);
  }

  async invalidateVersion(prefix: string): Promise<void> {
    if (!this.kv) return;
    const key = `_v:${prefix}`;
    const current = await this.kv.get(key);
    await this.kv.put(key, String(Number.parseInt(current ?? "0", 10) + 1));
  }

  async getVersion(prefix: string): Promise<string> {
    if (!this.kv) return "0";
    return (await this.kv.get(`_v:${prefix}`)) ?? "0";
  }
}

// TTL 常量 (秒)
export const CACHE_TTL = {
  PINNED_SITES: 3600, // 1 小时
  FEED_LATEST: 60, // 1 分钟
  FEED_TRENDING: 300, // 5 分钟
  FEED_POPULAR: 600, // 10 分钟
  VERSION_DETAIL: 1800, // 30 分钟
  SITE_DETAIL: 1800, // 30 分钟
  RELATED_SITES: 1800, // 30 分钟
  WEEKLY_FEED: 3600, // 1 小时
  SEARCH: 300, // 5 分钟
  TRENDING_DATA: 600, // 10 分钟
  TAGS_BY_TYPE: 3600, // 1 小时
} as const;
