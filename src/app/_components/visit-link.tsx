'use client'

// import { api } from "@/lib/trpc/react";
import type React from 'react'

interface VisitLinkProps extends React.ComponentPropsWithoutRef<'a'> {
  id: string
  count?: number
}

export const VisitLink = ({ id, count, ...props }: VisitLinkProps) => {
  // const utils = api.useUtils();
  // const [_count, setCount] = React.useState(count ?? 0);

  // React.useEffect(() => {
  //   setCount(count ?? 0);
  // }, [count]);

  // const visitInc = async (id: string) => {
  //   await utils.client.refSites.incVisit.mutate(id);
  //   if (count) {
  //     setCount((prev) => prev + 1);
  //   }
  // };

  return <a {...props}>{props.children}</a>
}
