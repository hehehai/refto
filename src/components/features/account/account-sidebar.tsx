"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BoxUserIcon, LikeIcon, SendIcon } from "@/components/shared/icons";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    title: "Profile",
    href: "/account",
    icon: BoxUserIcon,
  },
  {
    title: "My Favorites",
    href: "/account/favorites",
    icon: LikeIcon,
  },
  {
    title: "My Submissions",
    href: "/account/submissions",
    icon: SendIcon,
  },
];

export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-1">
      {sidebarItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-muted font-medium text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
            href={item.href}
            key={item.href}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}
