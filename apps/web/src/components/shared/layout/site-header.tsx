import { site } from "@refto-one/common";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SiteHeaderMenu } from "./site-header-menu";
import { SiteHeaderUser } from "./site-header-user";

export interface SiteHeaderProps {
  isLogin: boolean;
}

export function SiteHeader({ isLogin }: SiteHeaderProps) {
  return (
    <header className="w-full">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        {/* Left: Logo */}
        <Link className="font-semibold text-2xl" to="/">
          {site.siteName}
        </Link>

        {/* Right: Auth buttons + Menu */}
        <div className="flex items-center gap-2.5">
          {isLogin ? (
            <>
              <Button
                className="rounded-full"
                nativeButton={false}
                render={<Link to="/signin" />}
                variant="default"
              >
                Submit Site
              </Button>
              <SiteHeaderUser />
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
