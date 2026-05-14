import Link from "next/link";

export function SortLink({
  label,
  field,
  currentSortBy,
  currentSortOrder,
  searchParams,
}: {
  label: string;
  field: string;
  currentSortBy: string;
  currentSortOrder: "asc" | "desc";
  searchParams: URLSearchParams;
}) {
  const nextOrder =
    currentSortBy === field && currentSortOrder === "asc" ? "desc" : "asc";
  const params = new URLSearchParams(searchParams.toString());
  params.set("sortBy", field);
  params.set("sortOrder", nextOrder);
  params.delete("page");
  const active = currentSortBy === field;

  return (
    <Link href={`?${params.toString()}`} className="inline-flex items-center gap-1 hover:underline">
      {label}
      {active ? <span className="text-[10px]">{currentSortOrder === "asc" ? "ASC" : "DESC"}</span> : null}
    </Link>
  );
}
