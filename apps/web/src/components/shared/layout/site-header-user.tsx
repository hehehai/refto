import { UserRole } from "@refto-one/common";
import { Link, useNavigate } from "@tanstack/react-router";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { userProfileDialog } from "@/lib/sheets";
import { ThemeToggle } from "../theme-toggle";

export function SiteHeaderUser() {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  const isAdmin = session?.user?.role === UserRole.ADMIN;

  // Get user initials for avatar fallback
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  if (!session) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className="flex h-auto items-center gap-1.5 rounded-full px-1 py-1 pr-2"
            variant="default"
          >
            <Avatar className="size-6">
              <AvatarImage
                alt={session.user.name}
                src={session.user.image ?? undefined}
              />
              <AvatarFallback className="text-xs">
                {getInitials(session.user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-xs leading-none">
              {session.user.name}
            </span>
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="rouned-xl w-56">
        {/* User info section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-1.5 font-normal">
            <Avatar className="size-8">
              <AvatarImage
                alt={session.user.name}
                src={session.user.image ?? undefined}
              />
              <AvatarFallback className="text-xs">
                {getInitials(session.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <p className="font-medium text-xs leading-none">
                {session.user.name}
              </p>
              <p className="truncate text-muted-foreground text-xs">
                {session.user.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* User actions */}
        <DropdownMenuGroup>
          {/* Profile - will open dialog */}
          <DropdownMenuItem
            onClick={() => {
              userProfileDialog.openWithPayload(undefined);
            }}
          >
            <span className="i-hugeicons-user" />
            Profile
          </DropdownMenuItem>

          {/* Admin Dashboard */}
          {isAdmin && (
            <DropdownMenuItem onClick={() => navigate({ to: "/panel" })}>
              <span className="i-hugeicons-dashboard-square-02" />
              Dashboard
            </DropdownMenuItem>
          )}

          {/* My Likes */}
          <DropdownMenuItem render={<Link to="/likes" />}>
            <span className="i-hugeicons-thumbs-up-rectangle" />
            Likes
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Theme toggle */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-foreground">
              <span className="i-hugeicons-cinnamon-roll text-sm" />
              <span className="text-xs">Theme</span>
            </div>
            <ThemeToggle />
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Links */}
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link to="/about" />}>
            <span className="i-hugeicons-information-circle" />
            About
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() =>
              window.open("https://github.com", "_blank", "noopener")
            }
          >
            <span className="i-hugeicons-github" />
            GitHub
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Sign out */}
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    navigate({ to: "/" });
                  },
                },
              });
            }}
            variant="destructive"
          >
            <span className="i-hugeicons-logout-01" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
