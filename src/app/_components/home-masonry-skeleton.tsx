import { randomInt } from "@/lib/utils";

const items = Array.from({ length: 4 }, (_, i) =>
  Array.from({ length: 4 }, (_, j) => ({
    key: `${i}-${j}`,
    height: randomInt(400, 650),
  }))
);

export const HomeMasonrySkeleton = () => (
  <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-6">
    {items.map((cols, idx) => (
      <div
        className="flex flex-col gap-3 md:gap-4 lg:gap-6"
        key={idx as React.Key}
      >
        {cols.map((item) => (
          <div
            className="w-full rounded-lg bg-zinc-50 dark:bg-zinc-900"
            key={item.key}
            style={{ height: `${item.height}px` }}
          />
        ))}
      </div>
    ))}
  </div>
);
