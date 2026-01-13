import slug from "slug";
import { formatTimeShortWithMs } from "@/lib/time";

const slugify = (value?: string | null) =>
  value ? slug(value, { lower: true }) : "";

export function buildMarkerFilename({
  markerNumber,
  markerTime,
  markerTitle,
  siteTitle,
  pageTitle,
}: {
  markerNumber: number;
  markerTime: number;
  markerTitle?: string | null;
  siteTitle?: string | null;
  pageTitle?: string | null;
}) {
  const markerLabel = markerTitle?.trim()
    ? markerTitle
    : `marker-${markerNumber}`;
  const parts = [
    slugify(siteTitle),
    slugify(pageTitle),
    slugify(markerLabel) || `marker-${markerNumber}`,
  ].filter(Boolean) as string[];
  const timePart = formatTimeShortWithMs(markerTime).replace(/[:.]/g, "-");
  return `${[...parts, `t${timePart}`].join("__")}.jpg`;
}
