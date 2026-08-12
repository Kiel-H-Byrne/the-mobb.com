import ClientHome from "./ClientHome";
import { fetchAllCategories, fetchAllListings } from "./actions/geo-search";
import { SAMPLE_CATEGORIES } from "@/db/SampleListings";
import { unstable_cache } from "next/cache";

// Cache the initial listing fetch for 1 hour to reduce DB hits on initial load
const getCachedListings = unstable_cache(
  async () => fetchAllListings(),
  ["all-listings-initial"],
  { revalidate: 3600 }
);

const getCachedCategories = unstable_cache(
  async () => fetchAllCategories(),
  ["all-categories"],
  { revalidate: 3600 }
);

export default async function Page() {
  const initialListings = await getCachedListings();
  let initialCategories = await getCachedCategories();
  
  if (!initialCategories || initialCategories.length === 0) {
    initialCategories = SAMPLE_CATEGORIES;
  }

// Server Component
export default async function Home() {
  let categories = await fetchAllCategories();
  if (!categories || categories.length === 0) {
    categories = SAMPLE_CATEGORIES as string[];
  }
  
  // We no longer pre-fetch arbitrary listings. The map UI is scoped solely to user search and physical device location.
  const listings: any[] = [];
  
  return (
    <ClientHome 
      initialListings={initialListings || []} 
      initialCategories={initialCategories} 
    />
  );
}
