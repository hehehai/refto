import {
  filterSearchSchema,
  tagsByTypeSchema,
  trackPageViewSchema,
  trendingDataSchema,
} from "@refto-one/common";
import { and, count, desc, eq, ilike, isNull, or, sql } from "@refto-one/db";
import { eventLogs } from "@refto-one/db/schema/events";
import { sites } from "@refto-one/db/schema/sites";
import { siteTags, tags } from "@refto-one/db/schema/tags";
import { publicProcedure } from "../../index";
import { CACHE_TTL, KVCache } from "../../lib/cache";
import { CacheKeys } from "../../lib/cache-keys";
import { generateId } from "../../lib/utils";

export const filterRouter = {
  // Search tags and sites
  search: publicProcedure
    .input(filterSearchSchema)
    .handler(async ({ input, context }) => {
      const { q, limit } = input;
      const { db, kv } = context;
      const cache = new KVCache(kv);
      const cacheKey = CacheKeys.search(q, limit);

      // Define return type
      type SearchResult = {
        tags: Array<{
          id: string;
          name: string;
          value: string;
          type: string;
        }>;
        sites: Array<{
          id: string;
          title: string;
          slug: string;
          description: string | null;
          logo: string;
        }>;
      };

      // Try cache first
      const cached = await cache.get<SearchResult>(cacheKey);
      if (cached) {
        return cached;
      }

      const searchTerm = `%${q}%`;

      // Search tags
      const matchingTags = await db
        .select({
          id: tags.id,
          name: tags.name,
          value: tags.value,
          type: tags.type,
        })
        .from(tags)
        .where(
          and(
            isNull(tags.deletedAt),
            or(ilike(tags.name, searchTerm), ilike(tags.value, searchTerm))
          )
        )
        .limit(limit);

      // Search sites
      const matchingSites = await db
        .select({
          id: sites.id,
          title: sites.title,
          slug: sites.slug,
          description: sites.description,
          logo: sites.logo,
        })
        .from(sites)
        .where(
          and(
            isNull(sites.deletedAt),
            or(
              ilike(sites.title, searchTerm),
              ilike(sites.description, searchTerm)
            )
          )
        )
        .limit(limit);

      const result = {
        tags: matchingTags,
        sites: matchingSites,
      };

      // Cache the result
      await cache.set(cacheKey, result, { ttl: CACHE_TTL.SEARCH });

      return result;
    }),

  // Get trending data for empty state
  getTrendingData: publicProcedure
    .input(trendingDataSchema)
    .handler(async ({ input, context }) => {
      const { sitesLimit, tagsLimit } = input;
      const { db, kv } = context;
      const cache = new KVCache(kv);
      const cacheKey = CacheKeys.trendingData(sitesLimit, tagsLimit);

      // Define return type
      type TrendingDataResult = {
        sites: Array<{
          id: string;
          title: string;
          slug: string;
          logo: string;
          viewCount: number;
        }>;
        categories: Array<{
          id: string;
          name: string;
          value: string;
          type: string;
          tipMedia: string | null;
          usageCount: number;
        }>;
        sections: Array<{
          id: string;
          name: string;
          value: string;
          type: string;
          tipMedia: string | null;
          usageCount: number;
        }>;
        styles: Array<{
          id: string;
          name: string;
          value: string;
          type: string;
          tipMedia: string | null;
          usageCount: number;
        }>;
      };

      // Try cache first
      const cached = await cache.get<TrendingDataResult>(cacheKey);
      if (cached) {
        return cached;
      }

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const sevenDaysAgoISO = sevenDaysAgo.toISOString();

      // Trending sites: most viewed in last 7 days
      // Using subquery to count page views
      const trendingSites = await db
        .select({
          id: sites.id,
          title: sites.title,
          slug: sites.slug,
          logo: sites.logo,
          viewCount: sql<number>`COALESCE((
            SELECT COUNT(*)::int FROM event_logs
            WHERE event_logs.target_id = ${sites.id}
              AND event_logs.target_type = 'site'
              AND event_logs.event_type = 'PAGE_VIEWED'
              AND event_logs.created_at >= ${sevenDaysAgoISO}
          ), 0)`.as("view_count"),
        })
        .from(sites)
        .where(isNull(sites.deletedAt))
        .orderBy(
          desc(
            sql`COALESCE((
              SELECT COUNT(*) FROM event_logs
              WHERE event_logs.target_id = ${sites.id}
                AND event_logs.target_type = 'site'
                AND event_logs.event_type = 'PAGE_VIEWED'
                AND event_logs.created_at >= ${sevenDaysAgoISO}
            ), 0)`
          ),
          desc(sites.createdAt)
        )
        .limit(sitesLimit);

      // Get tags grouped by type with usage count
      const popularTags = await db
        .select({
          id: tags.id,
          name: tags.name,
          value: tags.value,
          type: tags.type,
          tipMedia: tags.tipMedia,
          usageCount: count(siteTags.siteId),
        })
        .from(tags)
        .leftJoin(siteTags, eq(siteTags.tagId, tags.id))
        .where(isNull(tags.deletedAt))
        .groupBy(tags.id)
        .orderBy(desc(count(siteTags.siteId)));

      // Split tags by type
      const categories = popularTags
        .filter((t) => t.type === "category")
        .slice(0, 3);
      const sections = popularTags
        .filter((t) => t.type === "section")
        .slice(0, tagsLimit);
      const styles = popularTags
        .filter((t) => t.type === "style")
        .slice(0, tagsLimit);

      const result = {
        sites: trendingSites,
        categories,
        sections,
        styles,
      };

      // Cache the result
      await cache.set(cacheKey, result, { ttl: CACHE_TTL.TRENDING_DATA });

      return result;
    }),

  // Get all tags by type
  getTagsByType: publicProcedure
    .input(tagsByTypeSchema)
    .handler(async ({ input, context }) => {
      const { type } = input;
      const { db, kv } = context;
      const cache = new KVCache(kv);
      const cacheKey = CacheKeys.tagsByType(type);

      // Define return type
      type TagsByTypeResult = Array<{
        id: string;
        name: string;
        value: string;
        type: string;
        description: string | null;
      }>;

      // Try cache first
      const cached = await cache.get<TagsByTypeResult>(cacheKey);
      if (cached) {
        return cached;
      }

      const tagList = await db
        .select({
          id: tags.id,
          name: tags.name,
          value: tags.value,
          type: tags.type,
          description: tags.description,
        })
        .from(tags)
        .where(and(eq(tags.type, type), isNull(tags.deletedAt)))
        .orderBy(tags.name);

      // Cache the result
      await cache.set(cacheKey, tagList, { ttl: CACHE_TTL.TAGS_BY_TYPE });

      return tagList;
    }),

  // Track page view (for trending calculation)
  // Note: This is a write operation, no caching needed
  trackPageView: publicProcedure
    .input(trackPageViewSchema)
    .handler(async ({ input, context }) => {
      const { siteId, pageId } = input;
      const userId = context.session?.user?.id ?? null;
      const { db } = context;

      // Insert page view event
      await db.insert(eventLogs).values({
        id: generateId(),
        eventType: "PAGE_VIEWED",
        userId,
        targetId: siteId,
        targetType: "site",
        metadata: pageId ? { pageId } : null,
      });

      // Increment site visit counter
      await db
        .update(sites)
        .set({ visits: sql<number>`${sites.visits} + 1` })
        .where(and(eq(sites.id, siteId), isNull(sites.deletedAt)));

      return { success: true };
    }),
};
