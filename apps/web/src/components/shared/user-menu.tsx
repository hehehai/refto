import { Link, useNavigate } from "@tanstack/react-router";
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
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";

export default function UserMenu() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton className="h-9 w-24" />;
  }

  if (!session) {
    return (
      <Button
        nativeButton={false}
        render={<Link to="/signin">Sign In</Link>}
        variant="outline"
      />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline">{session.user.name}</Button>}
      />

      <DropdownMenuContent className="min-w-44 bg-card">
        <DropdownMenuGroup>
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="truncate">
            {session.user.email}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              authClient.signOut({
                fetchOptions: {
                  onSuccess: () => {
                    navigate({
                      to: "/",
                    });
                  },
                },
              });
            }}
            variant="destructive"
          >
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
