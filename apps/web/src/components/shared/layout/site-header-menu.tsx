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
import { ThemeToggle } from "../theme-toggle";

export function SiteHeaderMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="rounded-full" variant="secondary">
            <span className="i-hugeicons-align-box-top-right" />
            Menu
          </Button>
        }
      />

      <DropdownMenuContent align="end" className="w-56 bg-card">
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
            onClick={() => window.open("#", "_blank", "noopener")}
          >
            <span className="i-hugeicons-user" />
            Author
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
