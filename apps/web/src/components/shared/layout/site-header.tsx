import { site } from "@refto-one/common";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { submitSiteDialog } from "@/lib/sheets";
import FilterIcon from "../icons/filter";
import { SendIcon } from "../icons/send";
import { SiteHeaderMenu } from "./site-header-menu";
import { SiteHeaderUser } from "./site-header-user";

export interface SiteHeaderProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
    role?: string | null;
  } | null;
}

export function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header className="w-full">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Left: Logo */}
        <Link className="font-semibold text-3xl" to="/">
          {site.siteName}
        </Link>

        {/* Right: Auth buttons + Menu */}
        <div className="flex items-center gap-2.5">
          <Button
            className="min-w-24 justify-between rounded-full pr-1.5! hover:border-primary"
            variant="outline"
          >
            <span>Filter</span>
            <span className="flex items-center justify-center rounded-full bg-primary p-1 text-white">
              <FilterIcon />
            </span>
          </Button>
          {user ? (
            <>
              <Button
                className="rounded-full"
                onClick={() => submitSiteDialog.openWithPayload(undefined)}
                variant="default"
              >
                <SendIcon />
                Submit Site
              </Button>
              <SiteHeaderUser initialUser={user} />
            </>
          ) : (
            <>
              <Button
                className="rounded-full"
                nativeButton={false}
                render={<Link to="/signin" />}
                variant="default"
              >
                Signin
              </Button>
              <Button
                className="rounded-full"
                nativeButton={false}
                render={<Link to="/signup" />}
                variant="secondary"
              >
                Signup
              </Button>
              <SiteHeaderMenu />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
