interface SiteHeroProps {
  site: {
    id: string;
    title: string;
    description: string;
    logo: string;
    url: string;
    tags: string[];
  };
}

export function SiteHero({ site }: SiteHeroProps) {
  return (
    <section className="border-b bg-muted/30 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-start gap-4">
          {/* Site logo */}
          <a href={site.url} rel="noopener noreferrer" target="_blank">
            <img
              alt={site.title}
              className="size-16 rounded-lg object-cover shadow-md"
              src={site.logo}
            />
          </a>

          {/* Site info */}
          <div className="flex-1">
            <h1 className="font-bold text-2xl">{site.title}</h1>
            <p className="mt-1 text-muted-foreground">{site.description}</p>

            {/* Tags */}
            {site.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {site.tags.map((tag) => (
                  <span
                    className="rounded-full bg-muted px-2.5 py-0.5 text-muted-foreground text-xs"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Visit site button */}
          <a
            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
            href={site.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="i-hugeicons-link-square-01" />
            Visit
          </a>
        </div>
      </div>
    </section>
  );
}
