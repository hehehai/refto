import { randomInt } from "@/lib/utils";

const items = Array.from({ length: 4 }, (_, i) => {
  return Array.from({ length: 4 }, (_, j) => ({
    key: `${i}-${j}`,
    height: randomInt(400, 650),
  }));
});

export const HomeMasonrySkeleton = () => {
  return (
    <div className="grid w-full grid-cols-4 gap-8">
      {items.map((cols, idx) => (
        <div key={idx} className="flex flex-col gap-8">
          {cols.map((item) => (
            <div
              key={item.key}
              style={{ height: `${item.height}px` }}
              className="w-full rounded-lg bg-zinc-50"
            />
          ))}
        </div>
      ))}
    </div>
  );
};
