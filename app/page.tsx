import { SAMPLE_CATEGORIES } from "@/db/SampleListings";
import { fetchAllCategories } from "./actions/geo-search";
import HomeClient from "./HomeClient";

// Server Component
export default async function Home() {
  let categories = await fetchAllCategories();
  if (!categories || categories.length === 0) {
    categories = SAMPLE_CATEGORIES as string[];
  }
  
  // We no longer pre-fetch arbitrary listings. The map UI is scoped solely to user search and physical device location.
  const listings: any[] = [];
  
  return (
    <HomeClient
      initialListings={listings}
      initialCategories={categories}
    />
  );
}
