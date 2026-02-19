// app/actions/geo-search.ts
import { createClient } from "@/utils/supabase/server";

export async function findBusinessesNearby(
  lat: number,
  lng: number,
  radiusMeters = 5000,
) {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("nearby_businesses", {
    user_lat: lat,
    user_lng: lng,
    radius_meters: radiusMeters,
  });

  if (error) throw error;
  return data;
}
