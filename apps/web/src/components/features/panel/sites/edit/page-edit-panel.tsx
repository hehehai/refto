import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageDialog } from "../page/page-dialog";
import { type Page, PageTabs } from "../page/page-tabs";

interface PageEditPanelProps {
  pages: Page[];
  activePageId: string | null;
  onPageSelect: (id: string) => void;
  // Dialog state
  dialogOpen: boolean;
  dialogMode: "create" | "edit";
  editingPage: Page | null;
  onDialogOpenChange: (open: boolean) => void;
  onAddPage: () => void;
  onEditPage: (page: Page) => void;
  onDeletePage: (page: Page) => void;
  onPageSubmit: (data: {
    title: string;
    url: string;
    isDefault: boolean;
  }) => Promise<void>;
  isSubmitting: boolean;
  // Delete confirmation
  deleteOpen: boolean;
  deletingPage: Page | null;
  onDeleteOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;
  children: React.ReactNode;
}

export function PageEditPanel({
  pages,
  activePageId,
  onPageSelect,
  dialogOpen,
  dialogMode,
  editingPage,
  onDialogOpenChange,
  onAddPage,
  onEditPage,
  onDeletePage,
  onPageSubmit,
  isSubmitting,
  deleteOpen,
  deletingPage,
  onDeleteOpenChange,
  onConfirmDelete,
  isDeleting,
  children,
}: PageEditPanelProps) {
  return (
    <>
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Page tabs */}
        <PageTabs
          activePageId={activePageId}
          onAddPage={onAddPage}
          onDeletePage={onDeletePage}
          onEditPage={onEditPage}
          onPageSelect={onPageSelect}
          pages={pages}
        />

        {/* Content area (versions) */}
        <div className="flex flex-1 overflow-hidden">{children}</div>
      </div>

      {/* Page Dialog */}
      <PageDialog
        isLoading={isSubmitting}
        mode={dialogMode}
        onOpenChange={onDialogOpenChange}
        onSubmit={onPageSubmit}
        open={dialogOpen}
        page={editingPage ?? undefined}
      />

      {/* Delete Page Confirmation */}
      <AlertDialog onOpenChange={onDeleteOpenChange} open={deleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Page</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deletingPage?.title}</strong>? All versions will also be
              deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                onConfirmDelete();
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
