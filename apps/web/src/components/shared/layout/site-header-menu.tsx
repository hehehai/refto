import { site } from "@refto-one/common";
import { Link } from "@tanstack/react-router";
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
import { AppIcon } from "../icons/app";
import { ThemeToggle } from "../theme-toggle";

export function SiteHeaderMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="rounded-full" variant="secondary">
            <AppIcon />
            Menu
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="w-50 bg-card">
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
            render={
              <a
                href={site.authorUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <span className="i-hugeicons-user" />
                {site.author}
              </a>
            }
          />

          <DropdownMenuItem
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
