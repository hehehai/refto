import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  versionId: string;
  liked: boolean;
  onLikeChange?: (liked: boolean) => void;
  className?: string;
}

export function LikeButton({
  versionId,
  liked: initialLiked,
  onLikeChange,
  className,
}: LikeButtonProps) {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      // Redirect to login if not authenticated
      window.location.href = "/signin";
      return;
    }

    if (isLoading) return;

    // Optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    onLikeChange?.(newLiked);
    setIsLoading(true);

    try {
      const result = await queryClient.fetchQuery(
        orpc.app.like.toggleLike.queryOptions({ input: { versionId } })
      );
      setLiked(result.liked);
      onLikeChange?.(result.liked);
    } catch {
      // Revert on error
      setLiked(!newLiked);
      onLikeChange?.(!newLiked);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className={cn("gap-1", className)}
      disabled={isLoading}
      onClick={handleClick}
      size="icon"
      variant="ghost"
    >
      <span
        className={cn(
          "text-lg",
          liked
            ? "i-hugeicons-favourite text-red-500"
            : "i-hugeicons-heart text-muted-foreground"
        )}
      />
    </Button>
  );
}
