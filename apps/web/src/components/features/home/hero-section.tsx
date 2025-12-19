interface PinnedSite {
  id: string;
  title: string;
  description: string;
  logo: string;
  url: string;
  tags: string[];
  page: {
    id: string;
    title: string;
    url: string;
  } | null;
  version: {
    id: string;
    webCover: string;
    webRecord?: string | null;
  } | null;
}

interface HeroSectionProps {
  pinnedSites: PinnedSite[];
}

export function HeroSection({ pinnedSites }: HeroSectionProps) {
  return (
    <section className="border-b bg-muted/30 py-12">
      <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-2">
        {/* Left: Tagline and features */}
        <div className="flex flex-col justify-center">
          <h1 className="font-bold text-3xl tracking-tight md:text-4xl lg:text-5xl">
            Unleash limitless inspiration
          </h1>
          <p className="mt-2 text-muted-foreground text-xl md:text-2xl">
            Embrace pure simplicity
          </p>

          <div className="mt-6 flex flex-col gap-2 text-muted-foreground">
            <p className="flex items-center gap-2">
              <span className="text-primary">✦</span>
              Curated design references
            </p>
            <p className="flex items-center gap-2">
              <span className="text-primary">✦</span>
              High-quality screenshots
            </p>
          </div>
        </div>

        {/* Right: Pinned sites */}
        <div className="grid gap-4 sm:grid-cols-3">
          {pinnedSites.map((site) => (
            <PinnedSiteCard key={site.id} site={site} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PinnedSiteCard({ site }: { site: PinnedSite }) {
  if (!site.version) {
    return null;
  }

  return (
    <div className="group relative aspect-[9/16] overflow-hidden rounded-lg bg-muted shadow-md">
      {site.version.webRecord ? (
        <video
          autoPlay
          className="size-full object-cover"
          loop
          muted
          playsInline
          poster={site.version.webCover}
        >
          <source src={site.version.webRecord} type="video/mp4" />
        </video>
      ) : (
        <img
          alt={site.title}
          className="size-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
          src={site.version.webCover}
        />
      )}

      {/* Overlay with site info */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <div className="flex items-center gap-2">
          <img alt={site.title} className="size-6 rounded" src={site.logo} />
          <span className="truncate font-medium text-sm text-white">
            {site.title}
          </span>
        </div>
      </div>
    </div>
  );
}
