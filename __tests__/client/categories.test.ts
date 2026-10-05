import {
  countCategories,
  listingMatchesCategories,
  toggleCategory,
} from "@/util/categories";
import { describe, expect, it } from "vitest";

describe("listingMatchesCategories", () => {
  it("shows everything when nothing is selected", () => {
    expect(
      listingMatchesCategories({ categories: ["Retail"] }, new Set()),
    ).toBe(true);
    expect(listingMatchesCategories({}, new Set())).toBe(true);
  });

  it("matches any selected category", () => {
    const selected = new Set(["Cafe", "Retail"]);
    expect(listingMatchesCategories({ categories: ["Retail"] }, selected)).toBe(
      true,
    );
    expect(listingMatchesCategories({ categories: ["Bakery"] }, selected)).toBe(
      false,
    );
  });

  it("treats listings without categories as Uncategorized", () => {
    expect(
      listingMatchesCategories({ categories: [] }, new Set(["Uncategorized"])),
    ).toBe(true);
    expect(listingMatchesCategories({}, new Set(["Retail"]))).toBe(false);
  });
});

describe("countCategories", () => {
  it("counts per category, buckets empty listings as Uncategorized, sorts by count", () => {
    expect(
      countCategories([
        { categories: ["Retail"] },
        { categories: ["Cafe", "Retail"] },
        { categories: [] },
        {},
      ]),
    ).toEqual([
      { name: "Retail", count: 2 },
      { name: "Uncategorized", count: 2 },
      { name: "Cafe", count: 1 },
    ]);
  });
});

describe("toggleCategory", () => {
  it("returns a new set with the category toggled", () => {
    const start = new Set(["Cafe"]);
    const added = toggleCategory(start, "Retail");
    expect([...added]).toEqual(["Cafe", "Retail"]);
    expect([...toggleCategory(added, "Cafe")]).toEqual(["Retail"]);
    expect([...start]).toEqual(["Cafe"]);
  });
});
