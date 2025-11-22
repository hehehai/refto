"use client";

import { useAtom } from "jotai";
import { refSiteSheetAtom } from "@/app/_store/sheet.store";

export const SiteShowcaseWrapper = ({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) => {
  const [_, setStatus] = useAtom(refSiteSheetAtom);

  return <div onClick={() => setStatus({ id })}>{children}</div>;
};
