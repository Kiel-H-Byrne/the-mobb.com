import { Listing } from "@/db/Types";

export type CategoryCount = { name: string; count: number };

/** "Uncategorized" covers listings tagged with it and listings with no categories. */
export const UNCATEGORIZED = "Uncategorized";

/**
 * Shared filter rule for every view: an empty selection shows everything;
 * otherwise a listing matches if any of its categories is selected.
 */
export const listingMatchesCategories = (
  listing: Pick<Listing, "categories">,
  selected: Set<string>,
): boolean => {
  if (selected.size === 0) return true;
  const categories = listing.categories ?? [];
  if (categories.length === 0) return selected.has(UNCATEGORIZED);
  return categories.some((c) => selected.has(c));
};

/** Client-side category counts for already-loaded listings, most common first. */
export const countCategories = (
  listings: Pick<Listing, "categories">[],
): CategoryCount[] => {
  const counts = new Map<string, number>();
  for (const listing of listings) {
    const categories = listing.categories?.length
      ? listing.categories
      : [UNCATEGORIZED];
    for (const name of new Set(categories)) {
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }
  return sortCategoryCounts(
    Array.from(counts, ([name, count]) => ({ name, count })),
  );
};

export const sortCategoryCounts = (counts: CategoryCount[]) =>
  counts.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

/** Returns a new selection with `name` toggled on or off. */
export const toggleCategory = (selected: Set<string>, name: string) => {
  const next = new Set(selected);
  if (next.has(name)) next.delete(name);
  else next.add(name);
  return next;
};
