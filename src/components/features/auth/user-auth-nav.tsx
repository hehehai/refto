"use client";

import {
  ExternalLinkIcon,
  GithubIcon,
  HeartIcon,
  InfoIcon,
  SendIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  MoonIcon,
  Spinner,
  SunIcon,
  SystemIcon,
} from "@/components/shared/icons";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { signOut } from "@/lib/auth-client";
import type { SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";

interface UserAuthNavProps {
  user?: SessionUser | null;
}

export function UserAuthNav({ user }: UserAuthNavProps) {
  const { setTheme, theme = "system" } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleSignOut = useCallback(async (event: Event) => {
    event.preventDefault();
    try {
      setLoading(true);
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            // Use hard refresh to clear cached session data
            window.location.href = "/";
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
  }, []);

  // Not logged in - show login button
  if (!user) {
    return (
      <Button asChild className="rounded-full">
        <Link href="/signin">Sign in</Link>
      </Button>
    );
  }

  const isAdmin = user.role === "ADMIN";
  // Display priority: image > name > email username
  const displayName = user.name || user.email?.split("@")[0];

  // Logged in - show user dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="rounded-full px-3" variant="secondary">
          <UserAvatar
            className="h-5 w-5"
            user={{ name: user.name, image: user.image }}
          />
          <span className="hidden md:inline">{displayName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {/* User info header */}
        <div className="p-3">
          <div className="flex items-center gap-2">
            <p className="font-medium">{displayName}</p>
            {isAdmin && (
              <Badge className="text-xs" variant="secondary">
                Admin
              </Badge>
            )}
          </div>
          {user.email && (
            <p className="mt-0.5 truncate text-muted-foreground text-sm">
              {user.email}
            </p>
          )}
        </div>

        <DropdownMenuSeparator />

        {/* Profile link */}
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={isAdmin ? "/admin" : "/account"}>
            <UserIcon className="mr-2 h-4 w-4" />
            {isAdmin ? "Admin Panel" : "Profile"}
          </Link>
        </DropdownMenuItem>

        {/* User-only menu items */}
        {!isAdmin && (
          <>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/account/favorites">
                <HeartIcon className="mr-2 h-4 w-4" />
                My Favorites
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/account/submissions">
                <SendIcon className="mr-2 h-4 w-4" />
                My Submissions
              </Link>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuSeparator />

        {/* Theme switcher */}
        <div className="flex items-center justify-between px-2 py-1.5">
          <span className="text-sm">Theme</span>
          <ToggleGroup
            className="gap-0"
            onValueChange={(value) => value && setTheme(value)}
            type="single"
            value={theme}
          >
            <ToggleGroupItem
              aria-label="Light mode"
              className={cn(
                "h-7 w-7 rounded-r-none rounded-l-md px-2",
                theme === "light" && "bg-muted"
              )}
              value="light"
            >
              <SunIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              aria-label="Dark mode"
              className={cn(
                "h-7 w-7 rounded-none px-2",
                theme === "dark" && "bg-muted"
              )}
              value="dark"
            >
              <MoonIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              aria-label="System mode"
              className={cn(
                "h-7 w-7 rounded-r-md rounded-l-none px-2",
                theme === "system" && "bg-muted"
              )}
              value="system"
            >
              <SystemIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <DropdownMenuSeparator />

        {/* Links */}
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/about">
            <InfoIcon className="mr-2 h-4 w-4" />
            About
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <a
            href="https://github.com/nicepkg/refto"
            rel="noopener noreferrer"
            target="_blank"
          >
            <GithubIcon className="mr-2 h-4 w-4" />
            GitHub
            <ExternalLinkIcon className="ml-auto h-3 w-3 text-muted-foreground" />
          </a>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sign out */}
        <DropdownMenuItem
          className="cursor-pointer"
          disabled={loading}
          onSelect={handleSignOut}
        >
          {loading && <Spinner className="mr-2" />}
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
