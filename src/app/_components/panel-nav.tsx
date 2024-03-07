"use client";

import {
  DashboardIcon,
  ListIcon,
  SubscriberIcon,
  WeeklyIcon,
} from "@/components/shared/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";

const panelNavMap = [
  {
    path: "/panel",
    label: "Dashboard",
    icon: DashboardIcon,
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
      {panelNavMap.map((item) => (
        <Link
          href={item.path}
          key={item.path}
          className="relative flex items-center pl-1 pr-1.5"
          onMouseEnter={() => setActive(item.path)}
          onMouseLeave={() => setActive(path)}
        >
          <item.icon className="mr-2 text-xl" />
          <span>{item.label}</span>
          {item.path === active && (
            <motion.div
              layoutId="underline"
              className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-xl bg-gray-950"
            />
          )}
        </Link>
      ))}
    </nav>
  );
};
