"use client";

import React from "react";
import { api } from "@/lib/trpc/react";
import { linkWithRef } from "@/lib/utils";

interface VisitLinkProps extends React.ComponentPropsWithoutRef<"a"> {
  id: string;
  count?: number;
  href: string;
}

export const VisitLink = ({ id, count, href, ...props }: VisitLinkProps) => {
  const utils = api.useUtils();
  const [_count, setCount] = React.useState(count ?? 0);

  React.useEffect(() => {
    setCount(count ?? 0);
  }, [count]);

  const visitInc = async (id: string) => {
    await utils.client.refSites.incVisit.mutate(id);
    if (count) {
      setCount((prev) => prev + 1);
    }
  };

  return (
    <span
      onClick={() => {
        visitInc(id);
      }}
    >
      <a {...props} href={linkWithRef(href, "refto.one")}>
        {props.children}
      </a>
    </span>
  );
};
