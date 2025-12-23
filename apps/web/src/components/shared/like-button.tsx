import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";
import { HeartFillIcon } from "./icons/heart-fill";
import { HeartLineIcon } from "./icons/heart-line";

interface LikeButtonProps {
  versionId: string;
  liked: boolean;
  onLikeChange?: (liked: boolean) => void;
  className?: string;
  variant?: ButtonProps["variant"];
}

export function LikeButton({
  versionId,
  liked: initialLiked,
  onLikeChange,
  variant = "ghost",
  className,
}: LikeButtonProps) {
  const { data: session } = authClient.useSession();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [liked, setLiked] = useState(initialLiked);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with prop changes
  useEffect(() => {
    setLiked(initialLiked);
  }, [initialLiked]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      // Redirect to login if not authenticated
      navigate({ to: "/signin" });
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
      variant={variant}
    >
      {liked ? (
        <HeartFillIcon className="text-lg text-red-500" />
      ) : (
        <HeartLineIcon className="text-lg text-muted-foreground" />
      )}
    </Button>
  );
}
