"use client";

import {
  DashboardIcon,
  DocIcon,
  ListIcon,
  SubscriberIcon,
  WeeklyIcon,
} from "@/components/shared/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { useLocale } from "next-intl";

const panelNavMap = (local: string) => [
  {
    path: `/${local}/panel`,
    label: {
      en: "Dashboard",
      "zh-CN": "仪表盘",
    }[local],
    icon: DashboardIcon,
  },
  {
    path: `/${local}/panel/submit-sites`,
    label: {
      en: "Submit Sites",
      "zh-CN": "站点提交",
    }[local],
    icon: DocIcon,
  },
  {
    path: `/${local}/panel/ref-sites`,
    label: {
      en: "Ref Sites",
      "zh-CN": "引用站点",
    }[local],
    icon: ListIcon,
  },
  {
    path: `/${local}/panel/weekly`,
    label: {
      en: "Weekly",
      "zh-CN": "每周精彩",
    }[local],
    icon: WeeklyIcon,
  },
  {
    path: `/${local}/panel/subscriber`,
    label: {
      en: "Subscriber",
      "zh-CN": "订阅者",
    }[local],
    icon: SubscriberIcon,
  },
];

interface PanelNavProps extends React.ComponentPropsWithoutRef<"nav"> {}

export const PanelNav = (props: PanelNavProps) => {
  const local = useLocale();
  const path = usePathname();
  const [active, setActive] = useState(path);
  const nav = useMemo(() => panelNavMap(local), [local]);

  return (
    <nav {...props}>
      {nav.map((item) => (
        <Link
          href={item.path}
          key={item.path}
          className="relative flex items-center pl-1 pr-1.5"
          onMouseEnter={() => setActive(item.path)}
          onMouseLeave={() => setActive(path)}
        >
          <item.icon className="mr-2 text-xl" />
          <span>{item.label}</span>
          {item.path.endsWith(active) && (
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
