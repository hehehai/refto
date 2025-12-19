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
import { ThemeToggle } from "./theme-toggle";

export default function UserMenu() {
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="icon" variant="ghost">
            {session ? (
              <Avatar className="size-8">
                <AvatarImage
                  alt={session.user.name}
                  src={session.user.image ?? undefined}
                />
                <AvatarFallback className="text-xs">
                  {getInitials(session.user.name)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <span className="i-hugeicons-menu-01 text-xl" />
            )}
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="w-56 bg-card">
        {session ? (
          <>
            {/* User info section */}
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="font-medium text-sm">{session.user.name}</p>
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
                <span className="i-hugeicons-user mr-2" />
                Profile
              </DropdownMenuItem>

              {/* Admin Dashboard */}
              {isAdmin && (
                <DropdownMenuItem onClick={() => navigate({ to: "/panel" })}>
                  <span className="i-hugeicons-dashboard-square-02 mr-2" />
                  Dashboard
                </DropdownMenuItem>
              )}

              {/* My Likes */}
              <DropdownMenuItem render={<Link to="/likes" />}>
                <span className="i-hugeicons-heart mr-2" />
                My Likes
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Theme toggle */}
            <DropdownMenuGroup>
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-sm">Theme</span>
                <ThemeToggle />
              </div>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Links */}
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link to="/about" />}>
                <span className="i-hugeicons-information-circle mr-2" />
                About
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  window.open("https://github.com", "_blank", "noopener")
                }
              >
                <span className="i-hugeicons-github mr-2" />
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
                <span className="i-hugeicons-logout-01 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        ) : (
          <>
            {/* Theme toggle for non-logged in users */}
            <DropdownMenuGroup>
              <div className="flex items-center justify-between px-2 py-1.5">
                <span className="text-sm">Theme</span>
                <ThemeToggle />
              </div>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            {/* Links */}
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link to="/about" />}>
                <span className="i-hugeicons-information-circle mr-2" />
                About
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => window.open("#", "_blank", "noopener")}
              >
                <span className="i-hugeicons-user mr-2" />
                Author
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  window.open("https://github.com", "_blank", "noopener")
                }
              >
                <span className="i-hugeicons-github mr-2" />
                GitHub
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
