"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchBar } from "@/components/search/search-bar";
import { ActiveFilters, FilterSheet } from "@/components/search/filter-sheet";

export function SearchControls({ categories, defaultQuery, openFilters }: { categories: { slug: string; name: string }[]; defaultQuery: string; openFilters: boolean }) {
  const [open, setOpen] = useState(openFilters);
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  return (
    <>
      <SearchBar
        defaultValue={defaultQuery}
        className="mb-4 lg:max-w-2xl"
        onFilter={() => setOpen(true)}
        onSubmit={(q) => {
          const next = new URLSearchParams(sp.toString());
          q ? next.set("q", q) : next.delete("q");
          next.delete("sahifa");
          router.push(`${pathname}?${next.toString()}`);
        }}
      />
      <ActiveFilters categories={categories} />
      <FilterSheet categories={categories} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
