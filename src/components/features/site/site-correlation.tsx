"use client";

import { useRouter } from "next/navigation";
import { SiteShowcase } from "./site-showcase";

export default function SiteCorrelation({
  sites,
}: {
  sites: {
    id: string;
    url: string;
    title: string;
    logo: string;
    pageId: string;
    visits: number;
    versionId: string;
    webCover: string;
    webRecord: string;
  }[];
}) {
  const router = useRouter();

  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 md:gap-6 lg:gap-8">
      {sites.map((item) => (
        <SiteShowcase
          fixedHeight={280}
          item={item}
          key={item.id}
          onDetail={() => router.push(`/${item.id}`, { scroll: true })}
        />
      ))}
    </div>
  );
}
