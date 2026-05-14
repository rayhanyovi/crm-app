import type { ReactNode } from "react";

export function DetailLayout({
  main,
  aside,
}: {
  main: ReactNode;
  aside: ReactNode;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">{main}</div>
      <aside className="space-y-6">{aside}</aside>
    </div>
  );
}
