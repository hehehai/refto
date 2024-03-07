import { Suspense } from "react";
import { HomeMasonry } from "@/app/_components/home-masonry";
import { HomeMasonrySkeleton } from "../_components/home-masonry-skeleton";
import { SiteEmailSubscription } from "../_components/site-email-subscription";

export default async function Home({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const search = searchParams.s || "";
  const tags = searchParams.tags?.split(",").filter(Boolean) || [];

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <section className="mt-24 grid grid-cols-4 gap-8">
          <div className="col-span-2 flex flex-col">
            <div className="">
              <h2 className="text-nowrap text-6xl leading-tight">
                Unleash limitless inspiration
                <br />
                Embrace pure simplicity
              </h2>
              <ul className="mt-6 space-y-2">
                <li>Stay on top of popular design trends</li>
                <li>Daily updates with an endless supply</li>
                <li>Receive the best websites of the week via email</li>
                <li>Follow other media X.com</li>
              </ul>
            </div>
            <SiteEmailSubscription className="mt-auto flex items-center space-x-5" />
          </div>
          <div className="col-span-1 flex flex-col">
            <div className="mt-auto">
              <div className="h-[216px] rounded-lg bg-zinc-50"></div>
            </div>
          </div>
          <div className="col-span-1 flex flex-col">
            <div className="mt-auto">
              <div className="h-[400px] rounded-lg bg-zinc-50"></div>
            </div>
          </div>
        </section>
        <section className="mt-24">
          <Suspense fallback={<HomeMasonrySkeleton />}>
            <HomeMasonry search={search} tags={tags} />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
