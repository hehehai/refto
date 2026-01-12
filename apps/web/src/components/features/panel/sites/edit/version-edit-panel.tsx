import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import { VersionDialog } from "../version/version-dialog";
import { VersionForm } from "../version/version-form";
import { VersionFormSkeleton } from "../version/version-form-skeleton";
import { VersionTabs } from "../version/version-tabs";
import { VideoMarkerDialog } from "../version/video-marker-dialog";
import { useSiteEdit } from "./site-edit-context";

export function VersionEditPanel() {
  const {
    versions,
    activeVersionId,
    versionsLoading,
    setActiveVersionId,
    handleVersionFormChange,
    versionDialogOpen,
    versionDialogMode,
    editingVersion,
    openVersionDialog,
    closeVersionDialog,
    handleVersionSubmit,
    handleDeleteVersion,
    isVersionSubmitting,
  } = useSiteEdit();

  const activeVersion = versions.find((v) => v.id === activeVersionId);

  return (
    <>
      {/* Version tabs (vertical) */}
      <VersionTabs
        activeVersionId={activeVersionId}
        onAddVersion={() => openVersionDialog("create")}
        onDeleteVersion={handleDeleteVersion}
        onEditVersion={(version) => openVersionDialog("edit", version)}
        onVersionSelect={setActiveVersionId}
        versions={versions}
      />

      {/* Version form */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeVersion ? (
          <VersionForm
            onChange={handleVersionFormChange}
            value={{
              siteOG: activeVersion.siteOG,
              webCover: activeVersion.webCover,
              webRecord: activeVersion.webRecord,
              tagIds: activeVersion.tagIds ?? [],
            }}
            versionId={activeVersionId ?? undefined}
          />
        ) : versionsLoading ? (
          <VersionFormSkeleton />
        ) : (
          <EmptyPlaceholder
            description="Add a version to get started"
            icon="i-hugeicons-folder-add"
          />
        )}
      </div>

      {/* Version Dialog */}
      <VersionDialog
        isLoading={isVersionSubmitting}
        mode={versionDialogMode}
        onOpenChange={(open) => !open && closeVersionDialog()}
        onSubmit={handleVersionSubmit}
        open={versionDialogOpen}
        version={editingVersion ?? undefined}
      />

      {/* Video Marker Dialog */}
      <VideoMarkerDialog />
    </>
  );
}
