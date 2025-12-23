import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";

interface SiteHeroProps {
  site: {
    id: string;
    title: string;
    description: string;
    logo: string;
    url: string;
    tags: string[];
    rating: number;
  };
}

export function SiteHero({ site }: SiteHeroProps) {
  return (
    <section className="py-8">
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
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Rating */}
            <div className="mt-3 flex items-center gap-2">
              <Rating max={5} readOnly value={site.rating} />
              <span className="text-muted-foreground text-sm">
                {site.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Visit site button */}
          <Button
            nativeButton={false}
            render={
              <a href={site.url} rel="noopener noreferrer" target="_blank">
                <span className="i-hugeicons-link-square-01" />
                Visit
              </a>
            }
            variant="outline"
          />
        </div>
      </div>
    </section>
  );
}
