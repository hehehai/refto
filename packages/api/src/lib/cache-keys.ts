// FNV-1a hash function for generating short, consistent cache key segments
function hashString(str: string): string {
  let hash = 2_166_136_261;
  for (let i = 0; i < str.length; i++) {
    // biome-ignore lint/suspicious/noBitwiseOperators: FNV-1a hash algorithm requires bitwise operations
    hash ^= str.charCodeAt(i);
    // biome-ignore lint/suspicious/noBitwiseOperators: unsigned right shift to keep hash as 32-bit unsigned
    hash = (hash * 16_777_619) >>> 0;
  }
  return hash.toString(36);
}

export const CacheKeys = {
  pinnedSites: (limit: number) => `app:pinned:${limit}`,

  versionsFeed: (
    sort: string,
    tags: string[] | undefined,
    cursor: string | undefined,
    limit: number
  ) =>
    `app:feed:${sort}:${tags?.length ? hashString(tags.sort().join(",")) : "_"}:${cursor ?? "0"}:${limit}`,

  versionDetail: (id: string) => `app:version:${id}`,

  siteDetail: (id: string) => `app:site:${id}`,

  versionBySlug: (siteSlug: string, pageSlug?: string, versionSlug?: string) =>
    `app:slug:${siteSlug}:${pageSlug ?? "_"}:${versionSlug ?? "_"}`,

  relatedSites: (siteId: string, limit: number) =>
    `app:related:${siteId}:${limit}`,

  weeklyFeed: (cursor: number, limit: number) =>
    `app:weekly:${cursor}:${limit}`,

  search: (q: string, limit: number) =>
    `filter:search:${hashString(q)}:${limit}`,

  trendingData: (sitesLimit: number, tagsLimit: number) =>
    `filter:trending:${sitesLimit}:${tagsLimit}`,

  tagsByType: (type: string) => `filter:tags:${type}`,
};

// 失效模式前缀
export const CachePrefix = {
  FEED: "feed",
  PINNED: "pinned",
  SITES: "sites",
  VERSIONS: "versions",
  TAGS: "tags",
  TRENDING: "trending",
  WEEKLY: "weekly",
  RELATED: "related",
} as const;
