import { Button, buttonVariants } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { SiteDetailView } from "../common/site-detail-view";
import { SiteForm } from "../common/site-form";
import { useSiteEdit } from "./site-edit-context";

export function SiteEditSide() {
  const {
    site,
    form,
    isEditingSite,
    isSavingSite,
    startEditSite,
    cancelEditSite,
  } = useSiteEdit();

  if (!site) return null;

  return (
    <div className="h-full w-100 shrink-0 border-r">
      <div className="h-[calc(100%-56px)] overflow-y-auto p-4">
        {isEditingSite ? (
          <form
            id="site-edit-form"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <SiteForm disabled={isSavingSite} form={form} />
          </form>
        ) : (
          <SiteDetailView
            site={{
              title: site.title,
              description: site.description,
              logo: site.logo,
              url: site.url,
              tagIds: site.tagIds,
              rating: site.rating,
              isPinned: site.isPinned,
            }}
          />
        )}
      </div>

      <div className="mt-auto flex h-14 items-center justify-between gap-2 border-border border-t px-3">
        <SheetClose
          className={cn(
            "border-border!",
            buttonVariants({ variant: "outline" })
          )}
        >
          Close
        </SheetClose>
        <div className="flex items-center gap-2">
          {isEditingSite ? (
            <>
              <Button
                disabled={isSavingSite}
                onClick={cancelEditSite}
                type="button"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                disabled={isSavingSite}
                form="site-edit-form"
                type="submit"
              >
                {isSavingSite ? "Saving..." : "Save"}
              </Button>
            </>
          ) : (
            <Button onClick={startEditSite} variant="outline">
              <span className="i-hugeicons-edit-02 mr-1.5 size-4" />
              Edit Site
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
