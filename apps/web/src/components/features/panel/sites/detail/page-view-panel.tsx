import type { ReactNode } from "react";
import { PageViewTabs } from "../page/page-view-tabs";
import { useSiteDetail } from "./site-detail-context";

interface PageViewPanelProps {
  children: ReactNode;
}

export function PageViewPanel({ children }: PageViewPanelProps) {
  const { pages, activePageId, setActivePageId } = useSiteDetail();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Page tabs */}
      <PageViewTabs
        activePageId={activePageId}
        onPageSelect={setActivePageId}
        pages={pages}
      />

      {/* Content area (versions) */}
      <div className="flex flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
