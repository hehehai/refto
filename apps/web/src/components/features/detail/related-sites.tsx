import { useState } from "react";
import { VersionGrid } from "@/components/shared/version-grid";

interface Tag {
  id: string;
  name: string;
  type: string;
}

interface RelatedSite {
  id: string;
  title: string;
  slug: string;
  description: string;
  logo: string;
  url: string;
  tags: Tag[];
  page: {
    id: string;
    title: string;
    slug: string;
    url: string;
  } | null;
  version: {
    id: string;
    versionDate: Date;
    webCover: string;
    webRecord?: string | null;
  } | null;
}

interface RelatedSitesProps {
  sites: RelatedSite[];
}

export function RelatedSites({ sites }: RelatedSitesProps) {
  const [likeMap, setLikeMap] = useState<Record<string, boolean>>({});

  // Filter out sites without versions and transform for VersionGrid
  const items = sites
    .filter((site) => site.version && site.page)
    .map((site) => ({
      version: site.version!,
      page: site.page!,
      site: {
        id: site.id,
        title: site.title,
        slug: site.slug,
        logo: site.logo,
        url: site.url,
      },
      liked: likeMap[site.version!.id] ?? false,
    }));

  const handleLikeChange = (versionId: string, liked: boolean) => {
    setLikeMap((prev) => ({ ...prev, [versionId]: liked }));
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="border-t py-8">
      <div className="container mx-auto px-4">
        <h2 className="mb-6 font-semibold text-xl">Related Sites</h2>
        <VersionGrid items={items} onLikeChange={handleLikeChange} />
      </div>
    </section>
  );
}
