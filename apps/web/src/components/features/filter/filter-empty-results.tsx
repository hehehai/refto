import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterEmptyResultsProps {
  onSubmitSite: () => void;
  className?: string;
}

export function FilterEmptyResults({
  onSubmitSite,
  className,
}: FilterEmptyResultsProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16",
        className
      )}
    >
      <span className="i-hugeicons-search-minus size-16 text-muted-foreground" />
      <p className="mt-4 text-muted-foreground">No results found</p>
      <p className="mt-1 text-muted-foreground text-sm">
        Can&apos;t find what you&apos;re looking for?
      </p>
      <Button className="mt-4" onClick={onSubmitSite} variant="outline">
        <span className="i-hugeicons-add-01 size-4" />
        Submit a Site
      </Button>
    </div>
  );
}
