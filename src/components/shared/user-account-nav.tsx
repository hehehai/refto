"use client";

import { useRouter } from "next/navigation";
import React, { useCallback } from "react";
import { toast } from "sonner";
import { BoxUserIcon, Spinner } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/lib/auth-client";

interface UserAccountNavProps extends React.ComponentPropsWithoutRef<"div"> {
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
  };
}

export function UserAccountNav({ user }: UserAccountNavProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState<boolean>(false);
  const userName = user.name || user.email?.split("@")[0];

  const handleSignOut = useCallback(
    async (event: Event) => {
      event.preventDefault();
      try {
        setLoading(true);
        await signOut({
          fetchOptions: {
            onSuccess: () => {
              router.push("/");
              router.refresh();
            },
          },
        });
      } catch (_err) {
        toast.error("Your sign out request failed. Please try again.", {
          description: "Something went wrong.",
        });
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-full">
          <BoxUserIcon className="mr-2 text-xl" />
          <span>{userName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuItem
          className="cursor-pointer"
          disabled={loading}
          onSelect={handleSignOut}
        >
          {loading && <Spinner className="mr-1" />}
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
