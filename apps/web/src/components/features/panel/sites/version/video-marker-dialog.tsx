import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMarkerHotkeys } from "@/hooks/use-marker-hotkeys";
import { useMarkerThumbnails } from "@/hooks/use-marker-thumbnails";
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
  videoUrl: string;
  coverUrl: string;
}

const MARKER_NUDGE_SECONDS = 0.1;

function VideoMarkerDialogContent({
  versionId,
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
  const { thumbnails } = useMarkerThumbnails({
    enabled: isVideoReady && !isPlaying,
    markers,
    videoRef,
  });
  const markersWithThumbnails = useMemo(
    () =>
      markers.map((marker) => ({
        ...marker,
        thumbnail: marker.thumbnail ?? thumbnails[marker.id],
      })),
    [markers, thumbnails]
  );
  const orderedMarkers = useMemo(
    () =>
      [...markersWithThumbnails].sort((a, b) => {
        if (a.time !== b.time) return a.time - b.time;
        return a.id.localeCompare(b.id);
      }),
    [markersWithThumbnails]
  );

  // Fetch existing markers when dialog opens
  useEffect(() => {
    async function fetchMarkers() {
      try {
        const result = await orpc.panel.marker.list.call({
          versionId,
        });

        // Convert to MarkerState (without thumbnails initially)
        const markerStates: MarkerState[] = result.map((m) => ({
          id: m.id,
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
  }, [versionId]);

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
      time,
      text: null,
      thumbnail,
    };

    setMarkers((prev) => [...prev, newMarker]);
    setSelectedMarkerId(newMarker.id);
  }, []);

  // Delete selected marker
  const handleDeleteSelected = useCallback(() => {
    if (!selectedMarkerId) return;

    setMarkers((prev) => prev.filter((m) => m.id !== selectedMarkerId));
    setSelectedMarkerId(null);
  }, [selectedMarkerId]);

  const clampTime = useCallback(
    (time: number) => {
      const maxDuration =
        duration > 0 ? duration : (videoRef.current?.getDuration() ?? 0);
      if (maxDuration > 0) {
        return Math.min(Math.max(0, time), maxDuration);
      }
      return Math.max(0, time);
    },
    [duration, videoRef]
  );

  const moveSelectedMarker = useCallback(
    (direction: -1 | 1) => {
      if (!selectedMarkerId) return;

      let updatedTime: number | null = null;

      setMarkers((prev) => {
        const index = prev.findIndex(
          (marker) => marker.id === selectedMarkerId
        );
        if (index === -1) return prev;

        const marker = prev[index];
        const nextTime = clampTime(
          marker.time + direction * MARKER_NUDGE_SECONDS
        );

        if (nextTime === marker.time) return prev;

        updatedTime = nextTime;
        const nextMarkers = [...prev];
        nextMarkers[index] = { ...marker, time: nextTime };
        return nextMarkers;
      });

      if (updatedTime !== null) {
        videoRef.current?.pause();
        videoRef.current?.seek(updatedTime);
        setCurrentTime(updatedTime);
      }
    },
    [clampTime, selectedMarkerId, videoRef]
  );

  const handleMoveSelectedLeft = useCallback(() => {
    moveSelectedMarker(-1);
  }, [moveSelectedMarker]);

  const handleMoveSelectedRight = useCallback(() => {
    moveSelectedMarker(1);
  }, [moveSelectedMarker]);

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
      setMarkers((prev) => prev.filter((m) => m.id !== id));
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
        markers: markers.map(({ thumbnail, ...m }) => m),
      });
      toast.success("Markers saved successfully");
      videoMarkerDialog.close();
    } catch {
      toast.error("Failed to save markers");
    } finally {
      setIsSaving(false);
    }
  }, [versionId, markers]);

  // Keyboard shortcuts
  useMarkerHotkeys({
    enabled: true,
    enableReorder: true,
    onPlayPause: handlePlayPause,
    onSeekLeft: () => handleRewind(0.1),
    onSeekRight: () => handleForward(0.1),
    onSeekLeftFast: () => handleRewind(1),
    onSeekRightFast: () => handleForward(1),
    onAddMarker: handleAddMarker,
    onDeleteSelected: handleDeleteSelected,
    onMoveSelectedUp: handleMoveSelectedLeft,
    onMoveSelectedDown: handleMoveSelectedRight,
  });

  return (
    <DialogContent
      className="flex h-[90vh] w-[90vw] max-w-6xl flex-col gap-0 rounded-2xl p-0 sm:max-w-6xl"
      overlayProps={{ forceRender: true }}
      showCloseButton={false}
    >
      <DialogHeader className="shrink-0 flex-row items-center justify-between border-b px-3 py-2">
        <DialogTitle>Video Markers</DialogTitle>
        <div className="flex w-69 items-center justify-between gap-3">
          <div className="text-xs">Markers ({markers.length})</div>
          <DialogClose render={<Button size="icon-xs" variant="ghost" />}>
            <span className="i-hugeicons-cancel-01 size-4" />
          </DialogClose>
        </div>
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
              markers={orderedMarkers}
              onSeek={handleSeek}
              onSeekToMarker={handleSeekToMarker}
              onSelectMarker={handleSelectMarker}
              selectedMarkerId={selectedMarkerId}
            />
          </div>
        </div>

        {/* Right: Marker list */}
        <div className="flex w-72 shrink-0 flex-col border-l">
          <MarkerListPanel
            markers={orderedMarkers}
            onDeleteMarker={handleDeleteMarker}
            onSeekToMarker={handleSeekToMarker}
            onSelectMarker={handleSelectMarker}
            onUpdateMarkerText={handleUpdateMarkerText}
            selectedMarkerId={selectedMarkerId}
          />
          <DialogFooter className="mx-0 my-0 shrink-0 border-t px-2 py-2">
            <Button
              onClick={() => videoMarkerDialog.close()}
              size="sm"
              variant="outline"
            >
              Cancel
            </Button>
            <Button disabled={isSaving} onClick={handleSave} size="sm">
              {isSaving ? "Saving..." : "Save Markers"}
            </Button>
          </DialogFooter>
        </div>
      </div>
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
            versionId={payload.versionId}
            videoUrl={payload.videoUrl}
          />
        );
      }}
    </Dialog>
  );
}
