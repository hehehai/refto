import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { FeedSection } from "@/components/features/home/feed-section";
import { HeroSection } from "@/components/features/home/hero-section";
import { orpc } from "@/lib/orpc";

export const Route = createFileRoute("/(app)/")({
  component: HomeComponent,
});

function HomeComponent() {
  // Fetch pinned sites for hero section
  const { data: pinnedSites = [] } = useQuery(
    orpc.app.site.getPinnedSites.queryOptions({ input: { limit: 3 } })
  );

  return (
    <div className="flex flex-col">
      {/* Hero section with tagline and pinned sites */}
      <HeroSection pinnedSites={pinnedSites} />

      {/* Feed section with infinite scroll grid */}
      <FeedSection />
    </div>
  );
}
