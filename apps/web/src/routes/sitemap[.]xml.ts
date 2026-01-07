import { site as siteConfig } from "@refto-one/common";
import { createDb, desc, isNull } from "@refto-one/db";
import { sitePages, sitePageVersions, sites } from "@refto-one/db/schema/sites";
import { createFileRoute } from "@tanstack/react-router";
import { format } from "date-fns";

const SITE_URL = siteConfig.url;

interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority: string;
}

function buildSitemapXml(entries: SitemapEntry[]): string {
  const urlEntries = entries
    .map(
      (entry) => `  <url>
    <loc>${SITE_URL}${entry.url}</loc>${
      entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""
    }
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

// Route type will be generated on build
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Route = createFileRoute("/sitemap.xml" as any)({
  server: {
    handlers: {
      GET: async () => {
        const db = createDb();

        // Static pages
        const staticEntries: SitemapEntry[] = [
          { url: "/", changefreq: "daily", priority: "1.0" },
          { url: "/about", changefreq: "monthly", priority: "0.5" },
          { url: "/weekly", changefreq: "weekly", priority: "0.8" },
        ];

        // Fetch all active sites with their pages and versions
        const allSites = await db.query.sites.findMany({
          where: isNull(sites.deletedAt),
          orderBy: [desc(sites.updatedAt)],
          with: {
            pages: {
              orderBy: [desc(sitePages.updatedAt)],
              with: {
                versions: {
                  orderBy: [desc(sitePageVersions.versionDate)],
                  limit: 10,
                },
              },
            },
          },
        });

        const dynamicEntries: SitemapEntry[] = [];

        for (const site of allSites) {
          // Site main page
          dynamicEntries.push({
            url: `/${site.slug}`,
            lastmod: format(site.updatedAt, "yyyy-MM-dd"),
            changefreq: "weekly",
            priority: "0.8",
          });

          // Each page and its versions
          for (const page of site.pages) {
            // Page entry
            dynamicEntries.push({
              url: `/${site.slug}/${page.slug}`,
              lastmod: format(page.updatedAt, "yyyy-MM-dd"),
              changefreq: "weekly",
              priority: "0.7",
            });

            // Version entries
            for (const version of page.versions) {
              const versionDate = format(version.versionDate, "yyyy-MM-dd");
              dynamicEntries.push({
                url: `/${site.slug}/${page.slug}/${versionDate}`,
                lastmod: format(version.createdAt, "yyyy-MM-dd"),
                changefreq: "monthly",
                priority: "0.6",
              });
            }
          }
        }

        const sitemap = buildSitemapXml([...staticEntries, ...dynamicEntries]);

        return new Response(sitemap, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
