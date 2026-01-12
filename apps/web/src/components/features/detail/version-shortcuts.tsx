import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

interface VersionShortcutsProps {
  className?: string;
}

export function VersionShortcuts({ className }: VersionShortcutsProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-8",
        className
      )}
    >
      <KbdGroup>
        <Kbd>Space</Kbd>
        <span>Play/Pause</span>
      </KbdGroup>
      <KbdGroup>
        <Kbd>←</Kbd>
        <Kbd>→</Kbd>
        <span>Seek 1s</span>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Shift</Kbd>
        <Kbd>←</Kbd>
        <Kbd>→</Kbd>
        <span>Seek 10s</span>
      </KbdGroup>
    </div>
  );
}
