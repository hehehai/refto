import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { SiteDetailPage } from "@/components/features/detail/site-detail-page";
import { useTrackPageView } from "@/components/features/detail/use-track-page-view";
import {
  createBreadcrumbSchema,
  createJsonLdScript,
  createSiteArticleSchema,
} from "@/lib/json-ld";
import { orpc } from "@/lib/orpc";
import { createDetailPageMeta } from "@/lib/seo";

export const Route = createFileRoute("/(app)/$siteSlug/")({
  component: SiteSlugIndexComponent,
  validateSearch: z.object({
    panel: z.enum(["record", "refs"]).optional(),
  }),
  loader: async ({ context, params }) => {
    const { siteSlug } = params;

    const data = await context.queryClient.ensureQueryData(
      orpc.app.site.getVersionBySlug.queryOptions({
        input: { siteSlug },
      })
    );

    // Prefetch related sites
    if (data.site.id) {
      await context.queryClient.prefetchQuery(
        orpc.app.site.getRelatedSites.queryOptions({
          input: { siteId: data.site.id, limit: 6 },
        })
      );
    }

    if (data.currentVersion?.id) {
      await context.queryClient.ensureQueryData(
        orpc.app.marker.list.queryOptions({
          input: { versionId: data.currentVersion.id },
        })
      );
    }

    return data;
  },
  head: ({ loaderData }) => {
    if (!(loaderData?.site && loaderData?.currentVersion)) return {};
    const { site, currentVersion } = loaderData;
    const url = `/${site.slug}`;
    const meta = createDetailPageMeta(
      site.title,
      site.description,
      currentVersion.webCover,
      url
    );

    const articleSchema = createSiteArticleSchema({
      title: site.title,
      description: site.description || `Explore ${site.title} design on Refto.`,
      image: currentVersion.webCover || "/images/og.jpg",
      url,
      datePublished: currentVersion.createdAt,
      dateModified: currentVersion.createdAt,
      tags: site.tags?.map((t) => t.name),
    });

    const breadcrumbSchema = createBreadcrumbSchema([
      { name: "Home", url: "/" },
      { name: site.title, url },
    ]);

    return {
      meta: meta.meta,
      links: meta.links,
      scripts: [
        createJsonLdScript(articleSchema),
        createJsonLdScript(breadcrumbSchema),
      ],
    };
  },
});

function SiteSlugIndexComponent() {
  const data = Route.useLoaderData();
  const { panel } = Route.useSearch();
  const { siteSlug } = Route.useParams();

  useTrackPageView(data?.site?.id, data?.currentPage?.id);

  return <SiteDetailPage key={siteSlug} panel={panel} siteSlug={siteSlug} />;
}
