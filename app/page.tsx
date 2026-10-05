import { SAMPLE_CATEGORIES } from "@/db/SampleListings";
import { unstable_cache } from "next/cache";
import ClientHome from "./ClientHome";
import { fetchAllCategories, fetchTopListings } from "./actions/geo-search";

// Cache the initial listing fetch for 1 hour to reduce DB hits on initial load
const getCachedListings = unstable_cache(
  async () => fetchTopListings(),
  ["all-listings-initial"],
  { revalidate: 3600 },
);

const getCachedCategories = unstable_cache(
  async () => fetchAllCategories(),
  ["all-categories"],
  { revalidate: 3600 },
);

export default async function Page() {
  const initialListings = await getCachedListings();
  let initialCategories = await getCachedCategories();

  if (!initialCategories || initialCategories.length === 0) {
    initialCategories = SAMPLE_CATEGORIES;
  }

  return (
    <ClientHome
      initialListings={initialListings || []}
      initialCategories={initialCategories}
    />
  );
}
