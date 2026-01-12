import { EmptyPlaceholder } from "@/components/shared/empty-placeholder";
import { VersionFormSkeleton } from "../version/version-form-skeleton";
import { VersionView } from "../version/version-view";
import { VersionViewTabs } from "../version/version-view-tabs";
import { VideoMarkerDetailDialog } from "../version/video-marker-detail-dialog";
import { useSiteDetail } from "./site-detail-context";

export function VersionViewPanel() {
  const { versions, activeVersionId, versionsLoading, setActiveVersionId } =
    useSiteDetail();

  const activeVersion = versions.find((v) => v.id === activeVersionId);

  return (
    <>
      {/* Version tabs (vertical) */}
      <VersionViewTabs
        activeVersionId={activeVersionId}
        onVersionSelect={setActiveVersionId}
        versions={versions}
      />

      {/* Version content (read-only) */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeVersion ? (
          <VersionView
            value={{
              siteOG: activeVersion.siteOG,
              webCover: activeVersion.webCover,
              webRecord: activeVersion.webRecord,
            }}
            versionId={activeVersion.id}
          />
        ) : versionsLoading ? (
          <VersionFormSkeleton />
        ) : (
          <EmptyPlaceholder
            description="No versions available"
            icon="i-hugeicons-folder-add"
          />
        )}
      </div>

      <VideoMarkerDetailDialog />
    </>
  );
}
