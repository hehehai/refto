import type { SVGProps } from "react";

export function PlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="currentColor"
      height="1em"
      viewBox="0 0 24 24"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Play</title>
      <path
        d="M17.49 9.6 5.6 16.77c-.7.42-1.6-.08-1.6-.9v-8a4.54 4.54 0 0 1 6.8-3.93l4.59 2.64 2.09 1.2c.69.41.7 1.41.01 1.82m.6 5.86-4.05 2.34L10 20.13a4 4 0 0 1-4.28-.18c-.58-.4-.51-1.29.1-1.65l12.71-7.62c.6-.36 1.39-.02 1.5.67a4 4 0 0 1-1.94 4.11"
        fill="currentColor"
      />
    </svg>
  );
}
