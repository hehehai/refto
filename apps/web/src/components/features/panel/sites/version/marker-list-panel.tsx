import { useCallback, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MarkerCard } from "./marker-card";
import type { MarkerState } from "./marker-timeline";

interface MarkerListPanelProps {
  markers: MarkerState[];
  selectedMarkerId: string | null;
  readOnly?: boolean;
  onSelectMarker: (id: string) => void;
  onUpdateMarkerText: (id: string, text: string) => void;
  onDeleteMarker: (id: string) => void;
  onSeekToMarker: (id: string) => void;
}

export function MarkerListPanel({
  markers,
  selectedMarkerId,
  readOnly,
  onSelectMarker,
  onUpdateMarkerText,
  onDeleteMarker,
  onSeekToMarker,
}: MarkerListPanelProps) {
  const selectedRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to selected marker
  useEffect(() => {
    if (selectedMarkerId && selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedMarkerId]);

  const handleUpdateText = useCallback(
    (id: string) => (text: string) => {
      onUpdateMarkerText(id, text);
    },
    [onUpdateMarkerText]
  );

  const handleDelete = useCallback(
    (id: string) => () => {
      onDeleteMarker(id);
    },
    [onDeleteMarker]
  );

  const handleSelect = useCallback(
    (id: string) => () => {
      onSelectMarker(id);
    },
    [onSelectMarker]
  );

  const handleSeekTo = useCallback(
    (id: string) => () => {
      onSeekToMarker(id);
    },
    [onSeekToMarker]
  );

  if (markers.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 text-center text-muted-foreground text-sm">
        <div>
          <div className="mb-1">No markers yet</div>
          <div className="text-xs">Press M or click + to add a marker</div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="space-y-1 p-2">
        {markers.map((marker, index) => (
          <MarkerCard
            isSelected={marker.id === selectedMarkerId}
            key={marker.id}
            marker={marker}
            markerNumber={index + 1}
            onDelete={handleDelete(marker.id)}
            onSeekTo={handleSeekTo(marker.id)}
            onSelect={handleSelect(marker.id)}
            onUpdateText={handleUpdateText(marker.id)}
            readOnly={readOnly}
            ref={marker.id === selectedMarkerId ? selectedRef : undefined}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
