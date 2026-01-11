import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMarkerHotkeys } from "@/hooks/use-marker-hotkeys";
import { orpc } from "@/lib/orpc";
import { videoMarkerDialog } from "@/lib/sheets";
import { MarkerListPanel } from "./marker-list-panel";
import type { MarkerState } from "./marker-timeline";
import { MarkerTimeline } from "./marker-timeline";
import { MarkerToolbar } from "./marker-toolbar";
import {
  MarkerVideoPlayer,
  type MarkerVideoPlayerHandle,
} from "./marker-video-player";

interface VideoMarkerDialogContentProps {
  versionId: string;
  recordType: "web" | "mobile";
  videoUrl: string;
  coverUrl: string;
}

function VideoMarkerDialogContent({
  versionId,
  recordType,
  videoUrl,
  coverUrl,
}: VideoMarkerDialogContentProps) {
  const videoRef = useRef<MarkerVideoPlayerHandle>(null);
  const [markers, setMarkers] = useState<MarkerState[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const isCapturingRef = useRef(false);

  // Fetch existing markers when dialog opens
  useEffect(() => {
    async function fetchMarkers() {
      try {
        const result = await orpc.panel.marker.list.call({
          versionId,
          recordType,
        });

        // Convert to MarkerState (without thumbnails initially)
        const markerStates: MarkerState[] = result.map((m) => ({
          id: m.id,
          sequence: m.sequence,
          time: m.time,
          text: m.text,
          thumbnail: undefined,
        }));

        setMarkers(markerStates);
      } catch {
        toast.error("Failed to load markers");
      }
    }

    setMarkers([]);
    setSelectedMarkerId(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setIsVideoReady(false);
    fetchMarkers();
  }, [versionId, recordType]);

  // Add marker at current time
  const handleAddMarker = useCallback(async () => {
    // Pause video first to ensure stable frame
    videoRef.current?.pause();
    const time = videoRef.current?.getCurrentTime() ?? 0;

    const capture = async () => {
      if (!videoRef.current) return;
      if (time === 0) {
        return (
          (await videoRef.current.captureFrameAt(0.01)) ??
          videoRef.current.captureFrame() ??
          undefined
        );
      }
      return videoRef.current.captureFrame() ?? undefined;
    };

    const thumbnail = await capture();

    const newMarker: MarkerState = {
      id: crypto.randomUUID(),
      sequence: markers.length + 1,
      time,
      text: null,
      thumbnail,
    };

    setMarkers((prev) => [...prev, newMarker]);
    setSelectedMarkerId(newMarker.id);
  }, [markers.length]);

  // Delete selected marker
  const handleDeleteSelected = useCallback(() => {
    if (!selectedMarkerId) return;

    setMarkers((prev) => {
      const filtered = prev.filter((m) => m.id !== selectedMarkerId);
      // Resequence
      return filtered.map((m, i) => ({ ...m, sequence: i + 1 }));
    });
    setSelectedMarkerId(null);
  }, [selectedMarkerId]);

  // Move selected marker up in sequence (swap with previous)
  const handleMoveSelectedLeft = useCallback(() => {
    if (!selectedMarkerId) return;

    setMarkers((prev) => {
      const index = prev.findIndex((m) => m.id === selectedMarkerId);
      if (index <= 0) return prev;

      const newMarkers = [...prev];
      // Swap sequences
      const temp = newMarkers[index].sequence;
      newMarkers[index] = {
        ...newMarkers[index],
        sequence: newMarkers[index - 1].sequence,
      };
      newMarkers[index - 1] = { ...newMarkers[index - 1], sequence: temp };
      // Sort by sequence
      return newMarkers.sort((a, b) => a.sequence - b.sequence);
    });
  }, [selectedMarkerId]);

  // Move selected marker down in sequence (swap with next)
  const handleMoveSelectedRight = useCallback(() => {
    if (!selectedMarkerId) return;

    setMarkers((prev) => {
      const index = prev.findIndex((m) => m.id === selectedMarkerId);
      if (index < 0 || index >= prev.length - 1) return prev;

      const newMarkers = [...prev];
      // Swap sequences
      const temp = newMarkers[index].sequence;
      newMarkers[index] = {
        ...newMarkers[index],
        sequence: newMarkers[index + 1].sequence,
      };
      newMarkers[index + 1] = { ...newMarkers[index + 1], sequence: temp };
      // Sort by sequence
      return newMarkers.sort((a, b) => a.sequence - b.sequence);
    });
  }, [selectedMarkerId]);

  // Playback controls
  const handlePlayFromStart = useCallback(() => {
    videoRef.current?.seek(0);
    setCurrentTime(0);
    videoRef.current?.play();
  }, []);

  const handleRewind = useCallback((seconds: number) => {
    const current = videoRef.current?.getCurrentTime() ?? 0;
    const nextTime = Math.max(0, current - seconds);
    videoRef.current?.seek(nextTime);
    setCurrentTime(nextTime);
  }, []);

  const handleForward = useCallback((seconds: number) => {
    const current = videoRef.current?.getCurrentTime() ?? 0;
    const dur = videoRef.current?.getDuration() ?? 0;
    const nextTime = Math.min(dur, current + seconds);
    videoRef.current?.seek(nextTime);
    setCurrentTime(nextTime);
  }, []);

  const handlePlayPause = useCallback(() => {
    if (videoRef.current?.isPlaying()) {
      videoRef.current?.pause();
    } else {
      videoRef.current?.play();
    }
  }, []);

  const handleDeleteAll = useCallback(() => {
    setMarkers([]);
    setSelectedMarkerId(null);
  }, []);

  const handleDurationChange = useCallback((nextDuration: number) => {
    setDuration(nextDuration);
    if (nextDuration > 0) {
      setIsVideoReady(true);
    }
  }, []);

  // Timeline interactions
  const handleSelectMarker = useCallback((id: string) => {
    setSelectedMarkerId(id);
  }, []);

  const handleSeekToMarker = useCallback(
    (id: string) => {
      const marker = markers.find((m) => m.id === id);
      if (marker) {
        videoRef.current?.seek(marker.time);
        videoRef.current?.pause();
        setCurrentTime(marker.time);
        setSelectedMarkerId(id);
      }
    },
    [markers]
  );

  const handleSeek = useCallback((time: number) => {
    videoRef.current?.seek(time);
    setCurrentTime(time);
  }, []);

  // Update marker text
  const handleUpdateMarkerText = useCallback((id: string, text: string) => {
    setMarkers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, text: text || null } : m))
    );
  }, []);

  // Delete single marker
  const handleDeleteMarker = useCallback(
    (id: string) => {
      setMarkers((prev) => {
        const filtered = prev.filter((m) => m.id !== id);
        return filtered.map((m, i) => ({ ...m, sequence: i + 1 }));
      });
      if (selectedMarkerId === id) {
        setSelectedMarkerId(null);
      }
    },
    [selectedMarkerId]
  );

  // Save markers
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await orpc.panel.marker.bulkSave.call({
        versionId,
        recordType,
        markers: markers.map(({ thumbnail, ...m }) => m),
      });
      toast.success("Markers saved successfully");
      videoMarkerDialog.close();
    } catch {
      toast.error("Failed to save markers");
    } finally {
      setIsSaving(false);
    }
  }, [versionId, recordType, markers]);

  // Populate thumbnails for existing markers
  useEffect(() => {
    if (
      !(isVideoReady && videoRef.current) ||
      isCapturingRef.current ||
      isPlaying
    ) {
      return;
    }
    const missing = markers.filter((marker) => !marker.thumbnail);
    if (missing.length === 0) return;

    isCapturingRef.current = true;
    let cancelled = false;

    const captureMissing = async () => {
      const thumbnails = new Map<string, string>();
      for (const marker of missing) {
        if (cancelled || !videoRef.current) break;
        const time = Math.max(0.01, marker.time);
        const thumbnail = await videoRef.current.captureFrameAt(time);
        if (thumbnail) {
          thumbnails.set(marker.id, thumbnail);
        }
      }

      if (!cancelled && thumbnails.size > 0) {
        setMarkers((prev) =>
          prev.map((marker) =>
            thumbnails.has(marker.id)
              ? { ...marker, thumbnail: thumbnails.get(marker.id) }
              : marker
          )
        );
      }

      if (!cancelled) {
        isCapturingRef.current = false;
      }
    };

    captureMissing();
    return () => {
      cancelled = true;
      isCapturingRef.current = false;
    };
  }, [markers, isVideoReady, isPlaying]);

  // Keyboard shortcuts
  useMarkerHotkeys({
    enabled: true,
    onPlayPause: handlePlayPause,
    onSeekLeft: () => handleRewind(1),
    onSeekRight: () => handleForward(1),
    onSeekLeftFast: () => handleRewind(10),
    onSeekRightFast: () => handleForward(10),
    onAddMarker: handleAddMarker,
    onDeleteSelected: handleDeleteSelected,
    onMoveSelectedUp: handleMoveSelectedLeft,
    onMoveSelectedDown: handleMoveSelectedRight,
  });

  return (
    <DialogContent
      className="flex h-[90vh] w-[90vw] max-w-6xl flex-col gap-0 rounded-2xl p-0 sm:max-w-6xl"
      overlayProps={{ forceRender: true }}
    >
      <DialogHeader className="shrink-0 border-b px-3 py-4">
        <DialogTitle>
          Video Markers - {recordType === "web" ? "Web" : "Mobile"} Record
        </DialogTitle>
      </DialogHeader>

      {/* Main content */}
      <div className="flex min-h-0 flex-1">
        {/* Left: Video + Controls */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Video player area */}
          <div className="flex flex-1 items-center justify-center bg-black p-4">
            <MarkerVideoPlayer
              cover={coverUrl}
              onDurationChange={handleDurationChange}
              onEnded={() => setIsPlaying(false)}
              onPause={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onTimeUpdate={setCurrentTime}
              ref={videoRef}
              src={videoUrl}
            />
          </div>

          {/* Toolbar */}
          <MarkerToolbar
            currentTime={currentTime}
            duration={duration}
            hasMarkers={markers.length > 0}
            isPlaying={isPlaying}
            onAddMarker={handleAddMarker}
            onDeleteAll={handleDeleteAll}
            onDeleteSelected={handleDeleteSelected}
            onForward={handleForward}
            onMoveSelectedLeft={handleMoveSelectedLeft}
            onMoveSelectedRight={handleMoveSelectedRight}
            onPlayFromStart={handlePlayFromStart}
            onPlayPause={handlePlayPause}
            onRewind={handleRewind}
            selectedMarkerId={selectedMarkerId}
          />

          {/* Timeline */}
          <div className="shrink-0 border-t p-3">
            <MarkerTimeline
              currentTime={currentTime}
              duration={duration}
              markers={markers}
              onSeek={handleSeek}
              onSeekToMarker={handleSeekToMarker}
              onSelectMarker={handleSelectMarker}
              selectedMarkerId={selectedMarkerId}
            />
          </div>
        </div>

        {/* Right: Marker list */}
        <div className="flex w-72 shrink-0 flex-col border-l">
          <div className="shrink-0 border-b px-3 py-2 font-medium text-sm">
            Markers ({markers.length})
          </div>
          <MarkerListPanel
            markers={markers}
            onDeleteMarker={handleDeleteMarker}
            onSeekToMarker={handleSeekToMarker}
            onSelectMarker={handleSelectMarker}
            onUpdateMarkerText={handleUpdateMarkerText}
            selectedMarkerId={selectedMarkerId}
          />
        </div>
      </div>

      {/* Footer */}
      <DialogFooter className="mx-0 my-0 shrink-0 border-t px-2 py-2">
        <Button onClick={() => videoMarkerDialog.close()} variant="outline">
          Cancel
        </Button>
        <Button disabled={isSaving} onClick={handleSave}>
          {isSaving ? "Saving..." : "Save Markers"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function VideoMarkerDialog() {
  return (
    <Dialog handle={videoMarkerDialog}>
      {({ payload }) => {
        if (!payload) return null;

        return (
          <VideoMarkerDialogContent
            coverUrl={payload.coverUrl}
            recordType={payload.recordType}
            versionId={payload.versionId}
            videoUrl={payload.videoUrl}
          />
        );
      }}
    </Dialog>
  );
}
