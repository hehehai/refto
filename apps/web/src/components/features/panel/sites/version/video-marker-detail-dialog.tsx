import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMarkerHotkeys } from "@/hooks/use-marker-hotkeys";
import { useMarkerThumbnails } from "@/hooks/use-marker-thumbnails";
import { orpc } from "@/lib/orpc";
import { videoMarkerDetailDialog } from "@/lib/sheets";
import { MarkerListPanel } from "./marker-list-panel";
import type { MarkerState } from "./marker-timeline";
import { MarkerTimeline } from "./marker-timeline";
import { MarkerToolbar } from "./marker-toolbar";
import {
  MarkerVideoPlayer,
  type MarkerVideoPlayerHandle,
} from "./marker-video-player";

interface VideoMarkerDetailDialogContentProps {
  versionId: string;
  videoUrl: string;
  coverUrl: string;
}

function VideoMarkerDetailDialogContent({
  versionId,
  videoUrl,
  coverUrl,
}: VideoMarkerDetailDialogContentProps) {
  const noop = useCallback(() => {
    // noop
  }, []);
  const videoRef = useRef<MarkerVideoPlayerHandle>(null);
  const [markers, setMarkers] = useState<MarkerState[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
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

  const handleDurationChange = useCallback((nextDuration: number) => {
    setDuration(nextDuration);
    if (nextDuration > 0) {
      setIsVideoReady(true);
    }
  }, []);

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

  useMarkerHotkeys({
    enabled: true,
    enableReorder: false,
    onPlayPause: handlePlayPause,
    onSeekLeft: () => handleRewind(1),
    onSeekRight: () => handleForward(1),
    onSeekLeftFast: () => handleRewind(10),
    onSeekRightFast: () => handleForward(10),
    onAddMarker: noop,
    onDeleteSelected: noop,
    onMoveSelectedUp: noop,
    onMoveSelectedDown: noop,
  });

  return (
    <DialogContent
      className="flex h-[90vh] w-[90vw] max-w-6xl flex-col gap-0 rounded-2xl p-0 sm:max-w-6xl"
      overlayProps={{ forceRender: true }}
    >
      <DialogHeader className="shrink-0 border-b px-3 py-4">
        <DialogTitle>Video Markers</DialogTitle>
      </DialogHeader>

      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
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

          <MarkerToolbar
            currentTime={currentTime}
            duration={duration}
            hasMarkers={markers.length > 0}
            isPlaying={isPlaying}
            onAddMarker={noop}
            onDeleteAll={noop}
            onDeleteSelected={noop}
            onForward={handleForward}
            onMoveSelectedLeft={noop}
            onMoveSelectedRight={noop}
            onPlayFromStart={handlePlayFromStart}
            onPlayPause={handlePlayPause}
            onRewind={handleRewind}
            readOnly
            selectedMarkerId={selectedMarkerId}
          />

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

        <div className="flex w-72 shrink-0 flex-col border-l">
          <div className="shrink-0 border-b px-3 py-2 font-medium text-sm">
            Markers ({markers.length})
          </div>
          <MarkerListPanel
            markers={orderedMarkers}
            onDeleteMarker={noop}
            onSeekToMarker={handleSeekToMarker}
            onSelectMarker={handleSelectMarker}
            onUpdateMarkerText={noop}
            readOnly
            selectedMarkerId={selectedMarkerId}
          />
        </div>
      </div>
    </DialogContent>
  );
}

export function VideoMarkerDetailDialog() {
  return (
    <Dialog handle={videoMarkerDetailDialog}>
      {({ payload }) => {
        if (!payload) return null;

        return (
          <VideoMarkerDetailDialogContent
            coverUrl={payload.coverUrl}
            versionId={payload.versionId}
            videoUrl={payload.videoUrl}
          />
        );
      }}
    </Dialog>
  );
}
