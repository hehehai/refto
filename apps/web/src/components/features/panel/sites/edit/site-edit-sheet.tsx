import { Dialog } from "@base-ui/react/dialog";
import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { siteEditSheet } from "@/lib/sheets";
import { PageEditPanel } from "./page-edit-panel";
import { SiteEditProvider, useSiteEdit } from "./site-edit-context";
import { SiteEditSide } from "./site-edit-side";
import { SiteEditSkeleton } from "./site-edit-skeleton";
import { VersionEditPanel } from "./version-edit-panel";

function SiteEditContent() {
  const { site, isLoading, pages, activePageId } = useSiteEdit();

  const activePage = pages.find((p) => p.id === activePageId);

  if (isLoading) {
    return <SiteEditSkeleton />;
  }

  if (!site) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Site not found
      </div>
    );
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left side - Site detail/form */}
      <SiteEditSide />

      {/* Right side - Pages & Versions */}
      <PageEditPanel>
        {activePage ? (
          <VersionEditPanel />
        ) : (
          <EmptyPlaceholder
            className="flex-1"
            description="Add a page to get started"
            icon="i-hugeicons-file-add"
          />
        )}
      </PageEditPanel>
    </div>
  );
}

export function SiteEditSheet() {
  return (
    <Dialog.Root handle={siteEditSheet}>
      {({ payload }) =>
        payload && (
          <SiteEditProvider open={true} siteId={payload.siteId}>
            <SheetContent
              className="h-full border-none bg-transparent p-3 shadow-none data-[side=right]:max-w-3/4 data-[side=right]:sm:max-w-3/4"
              showCloseButton={false}
              side="right"
            >
              <div className="flex h-full w-full flex-col gap-4 rounded-xl bg-background shadow-lg">
                <SheetHeader className="sr-only">
                  <SheetTitle>Edit Site</SheetTitle>
                  <SheetDescription>
                    Edit site details and pages
                  </SheetDescription>
                </SheetHeader>
                <SiteEditContent />
              </div>
            </SheetContent>
          </SiteEditProvider>
        )
      }
    </Dialog.Root>
  );
}
