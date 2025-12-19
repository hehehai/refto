import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import { Logo } from "./logo";
import UserMenu from "./user-menu";

export default function Header() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Left: Logo */}
        <Link className="flex items-center gap-2" to="/">
          <Logo className="size-8" />
          <span className="font-semibold text-lg">Refto</span>
        </Link>

        {/* Right: Auth buttons + Menu */}
        <div className="flex items-center gap-2">
          {isPending ? (
            <Skeleton className="h-9 w-24" />
          ) : session ? null : (
            <>
              <Button
                nativeButton={false}
                render={<Link to="/signin" />}
                size="sm"
                variant="ghost"
              >
                Login
              </Button>
              <Button
                nativeButton={false}
                render={<Link to="/signup" />}
                size="sm"
                variant="outline"
              >
                Register
              </Button>
            </>
          )}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
