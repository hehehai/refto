import type { ReactNode } from "react";
import { PageDialog } from "../page/page-dialog";
import { PageTabs } from "../page/page-tabs";
import { useSiteEdit } from "./site-edit-context";

interface PageEditPanelProps {
  children: ReactNode;
}

export function PageEditPanel({ children }: PageEditPanelProps) {
  const {
    pages,
    activePageId,
    setActivePageId,
    pageDialogOpen,
    pageDialogMode,
    editingPage,
    openPageDialog,
    closePageDialog,
    handlePageSubmit,
    handleDeletePage,
    isPageSubmitting,
  } = useSiteEdit();

  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Page tabs */}
        <PageTabs
          activePageId={activePageId}
          onAddPage={() => openPageDialog("create")}
          onDeletePage={handleDeletePage}
          onEditPage={(page) => openPageDialog("edit", page)}
          onPageSelect={setActivePageId}
          pages={pages}
        />

        {/* Content area (versions) */}
        <div className="flex flex-1 overflow-hidden">{children}</div>
      </div>

      {/* Page Dialog */}
      <PageDialog
        isLoading={isPageSubmitting}
        mode={pageDialogMode}
        onOpenChange={(open) => !open && closePageDialog()}
        onSubmit={handlePageSubmit}
        open={pageDialogOpen}
        page={editingPage ?? undefined}
      />
    </>
  );
}
