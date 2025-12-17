import { Button, buttonVariants } from "@/components/ui/button";
import { DrawerClose } from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { SiteDetailView } from "../common/site-detail-view";
import { SiteForm } from "../common/site-form";

interface Site {
  title: string;
  description: string | null;
  logo: string | null;
  url: string;
  tags: string[];
  rating: number;
  isPinned: boolean;
}

interface SiteEditHeaderProps {
  site: Site;
  isEditing: boolean;
  isSaving: boolean;
  form: any;
  onStartEdit: () => void;
  onCancelEdit: () => void;
}

export function SiteEditHeader({
  site,
  isEditing,
  isSaving,
  form,
  onStartEdit,
  onCancelEdit,
}: SiteEditHeaderProps) {
  return (
    <div className="h-full w-100 shrink-0 border-r">
      <div className="h-[calc(100%-56px)] overflow-y-auto p-4">
        {isEditing ? (
          <form
            id="site-edit-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <SiteForm disabled={isSaving} form={form} />
          </form>
        ) : (
          <SiteDetailView
            site={{
              title: site.title,
              description: site.description ?? "",
              logo: site.logo ?? "",
              url: site.url,
              tags: site.tags,
              rating: site.rating,
              isPinned: site.isPinned,
            }}
          />
        )}
      </div>

      <div className="mt-auto flex h-14 items-center justify-between gap-2 border-border border-t px-4">
        <DrawerClose
          className={cn(
            "border-border!",
            buttonVariants({ variant: "outline" })
          )}
        >
          Close
        </DrawerClose>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                disabled={isSaving}
                onClick={onCancelEdit}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button disabled={isSaving} form="site-edit-form" type="submit">
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button onClick={onStartEdit} variant="outline">
              <span className="i-hugeicons-edit-02 mr-1.5 size-4" />
              Edit Site
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
