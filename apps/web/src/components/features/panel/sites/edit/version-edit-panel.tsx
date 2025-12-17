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
import { VersionDialog } from "../version/version-dialog";
import { VersionForm } from "../version/version-form";
import { VersionFormSkeleton } from "../version/version-form-skeleton";
import { type Version, VersionTabs } from "../version/version-tabs";

interface FullVersion extends Version {
  siteOG: string | null;
  webCover: string;
  webRecord: string | null;
  mobileCover: string | null;
  mobileRecord: string | null;
}

interface VersionEditPanelProps {
  versions: FullVersion[];
  activeVersionId: string | null;
  isLoading: boolean;
  onVersionSelect: (id: string) => void;
  onVersionFormChange: (data: Partial<FullVersion>) => void;
  // Dialog state
  dialogOpen: boolean;
  dialogMode: "create" | "edit";
  editingVersion: FullVersion | null;
  onDialogOpenChange: (open: boolean) => void;
  onAddVersion: () => void;
  onEditVersion: (version: Version) => void;
  onDeleteVersion: (version: Version) => void;
  onVersionSubmit: (data: {
    versionDate: Date;
    versionNote?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  // Delete confirmation
  deleteOpen: boolean;
  deletingVersion: Version | null;
  onDeleteOpenChange: (open: boolean) => void;
  onConfirmDelete: () => void;
  isDeleting: boolean;
}

export function VersionEditPanel({
  versions,
  activeVersionId,
  isLoading,
  onVersionSelect,
  onVersionFormChange,
  dialogOpen,
  dialogMode,
  editingVersion,
  onDialogOpenChange,
  onAddVersion,
  onEditVersion,
  onDeleteVersion,
  onVersionSubmit,
  isSubmitting,
  deleteOpen,
  deletingVersion: _deletingVersion,
  onDeleteOpenChange,
  onConfirmDelete,
  isDeleting,
}: VersionEditPanelProps) {
  const activeVersion = versions.find((v) => v.id === activeVersionId);

  return (
    <>
      {/* Version tabs (vertical) */}
      <VersionTabs
        activeVersionId={activeVersionId}
        onAddVersion={onAddVersion}
        onDeleteVersion={onDeleteVersion}
        onEditVersion={onEditVersion}
        onVersionSelect={onVersionSelect}
        versions={versions}
      />

      {/* Version form */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeVersion ? (
          <VersionForm
            onChange={onVersionFormChange}
            value={{
              siteOG: activeVersion.siteOG,
              webCover: activeVersion.webCover,
              webRecord: activeVersion.webRecord,
              mobileCover: activeVersion.mobileCover,
              mobileRecord: activeVersion.mobileRecord,
            }}
          />
        ) : isLoading ? (
          <VersionFormSkeleton />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <span className="i-hugeicons-folder-add mb-2 block size-12 opacity-50" />
              <p>Add a version to get started</p>
            </div>
          </div>
        )}
      </div>

      {/* Version Dialog */}
      <VersionDialog
        isLoading={isSubmitting}
        mode={dialogMode}
        onOpenChange={onDialogOpenChange}
        onSubmit={onVersionSubmit}
        open={dialogOpen}
        version={editingVersion ?? undefined}
      />

      {/* Delete Version Confirmation */}
      <AlertDialog onOpenChange={onDeleteOpenChange} open={deleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Version</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this version? This action cannot
              be undone.
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
