"use client";

import type { Session } from "next-auth";
import { signOut } from "next-auth/react";
import React, { useCallback } from "react";
import { BoxUserIcon, Spinner } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "../ui/use-toast";

interface UserAccountNavProps extends React.ComponentPropsWithoutRef<"div"> {
  user: Session["user"];
}

export function UserAccountNav({ user }: UserAccountNavProps) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState<boolean>(false);
  const userName = user.name || user.email?.split("@")[0];

  const handleSignOut = useCallback(
    async (event: Event) => {
      event.preventDefault();
      try {
        setLoading(true);
        await signOut({
          callbackUrl: `${window.location.origin}/`,
        });
      } catch (_err) {
        toast({
          title: "Something went wrong.",
          description: "Your sign out request failed. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
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
