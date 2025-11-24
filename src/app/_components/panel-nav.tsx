"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  DashboardIcon,
  DocIcon,
  ListIcon,
  SubscriberIcon,
  WeeklyIcon,
} from "@/components/shared/icons";

const panelNav = [
  {
    path: "/panel",
    label: "Dashboard",
    icon: DashboardIcon,
  },
  {
    path: "/panel/submit-sites",
    label: "Submit Sites",
    icon: DocIcon,
  },
  {
    path: "/panel/ref-sites",
    label: "Ref Sites",
    icon: ListIcon,
  },
  {
    path: "/panel/weekly",
    label: "Weekly",
    icon: WeeklyIcon,
  },
  {
    path: "/panel/subscriber",
    label: "Subscriber",
    icon: SubscriberIcon,
  },
];

interface PanelNavProps extends React.ComponentPropsWithoutRef<"nav"> {}

export const PanelNav = (props: PanelNavProps) => {
  const path = usePathname();
  const [active, setActive] = useState(path);

  return (
    <nav {...props}>
      {panelNav.map((item) => (
        <Link
          className="relative flex items-center pr-1.5 pl-1"
          href={item.path}
          key={item.path}
          onMouseEnter={() => setActive(item.path)}
          onMouseLeave={() => setActive(path)}
        >
          <item.icon className="mr-2 text-xl" />
          <span>{item.label}</span>
          {item.path.endsWith(active) && (
            <motion.div
              className="absolute right-0 bottom-0 left-0 h-[3px] rounded-t-xl bg-gray-950 dark:bg-zinc-500"
              layoutId="underline"
            />
          )}
        </Link>
      ))}
    </nav>
  );
};
