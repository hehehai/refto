import { site, UserRole } from "@refto-one/common";
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

interface SiteHeaderUserProps {
  initialUser: {
    name: string;
    email: string;
    image?: string | null;
    role?: string | null;
  };
}

export function SiteHeaderUser({ initialUser }: SiteHeaderUserProps) {
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();

  // Use session data if available, otherwise use initial user data from server
  const user = session?.user ?? initialUser;

  const isAdmin = user.role === UserRole.ADMIN;

  // Get user initials for avatar fallback
  const getInitials = (name: string) => name.at(1)?.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            className="flex items-center rounded-full pl-3"
            variant="secondary"
          >
            <Avatar className="size-5">
              <AvatarImage alt={user.name} src={user.image ?? undefined} />
              <AvatarFallback className="text-xs">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            {user.name}
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="rouned-xl w-50">
        {/* User info section */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-1.5 font-normal">
            <Avatar className="size-8">
              <AvatarImage alt={user.name} src={user.image ?? undefined} />
              <AvatarFallback className="text-xs">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-0.5">
              <p className="font-medium text-xs leading-none">{user.name}</p>
              <p className="truncate text-muted-foreground text-xs">
                {user.email}
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

          {/* My Submits */}
          <DropdownMenuItem render={<Link to="/submits" />}>
            <span className="i-hugeicons-sent" />
            Submits
          </DropdownMenuItem>

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
            onClick={() => window.open(site.githubUrl, "_blank", "noopener")}
            render={
              <a
                href={site.githubUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="i-hugeicons-github" />
                GitHub
              </a>
            }
          />
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
