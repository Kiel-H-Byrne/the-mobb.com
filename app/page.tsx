import { SAMPLE_CATEGORIES } from "@/db/SampleListings";
import { parseViewParam, ViewMode } from "@/util/view";
import { Metadata } from "next";
import { unstable_cache } from "next/cache";
import ClientHome from "./ClientHome";
import { fetchAllCategories, fetchMapListings } from "./actions/geo-search";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const viewMode = parseViewParam(resolvedParams.view);

  if (viewMode === "GRID") {
    return {
      title: "Global Directory | MOBB",
      description:
        "Explore verified Black-owned businesses across the world without physical boundaries. The Global Directory on MOBB.",
      alternates: {
        canonical: "/?view=directory",
      },
      openGraph: {
        title: "Global Directory | MOBB",
        description:
          "Explore verified Black-owned businesses across the world without physical boundaries.",
        url: "https://mobb.kielbyrne.com/?view=directory",
      },
    };
  }

  if (viewMode === "ORBIT") {
    return {
      title: "Digital Orbit | Online Only Black-Owned Businesses | MOBB",
      description:
        "Discover global digital storefronts and online-only services built by the diaspora. No borders, just pure digital commerce.",
      alternates: {
        canonical: "/?view=online",
      },
      openGraph: {
        title: "Digital Orbit | MOBB",
        description:
          "Discover global digital storefronts and online-only services built by the diaspora.",
        url: "https://mobb.kielbyrne.com/?view=online",
      },
    };
  }

  return {
    title: "MOBB | Map of Black Businesses",
    description:
      "The Map of Black Businesses. Give your dollar the choice to make a difference... Just MOBB It.",
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: "MOBB | Map of Black Businesses",
      description:
        "The digital infrastructure for economic equity. Locate, patronize, and support Black-owned businesses in your immediate vicinity.",
      url: "https://mobb.kielbyrne.com",
    },
  };
}

// Cache the initial listing fetch for 1 hour to reduce DB hits on initial load
const getCachedListings = unstable_cache(
  async () => fetchMapListings(),
  ["map-listings-v1"],
  { revalidate: 3600 },
);

const getCachedCategories = unstable_cache(
  async () => fetchAllCategories(),
  ["all-categories"],
  { revalidate: 3600 },
);

export default async function Page({ searchParams }: PageProps) {
  const [resolvedParams, initialListings, fetchedCategories] = await Promise.all([
    searchParams,
    getCachedListings(),
    getCachedCategories(),
  ]);

  const viewMode: ViewMode = parseViewParam(resolvedParams.view);

  let initialCategories = fetchedCategories;
  if (!initialCategories || initialCategories.length === 0) {
    initialCategories = SAMPLE_CATEGORIES;
  }

  return (
    <ClientHome
      initialListings={initialListings || []}
      initialCategories={initialCategories}
      initialView={viewMode}
    />
  );
}
